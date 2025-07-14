const testFieldBuilder = {
  number:() => new NumberFieldBuilder,
  string:() => new StringFieldBuilder,
}
abstract class BaseFieldBuilder<T extends DataTypes>{
  build():FieldType<T>{
    return {dataType:this.getType()}}
  abstract getType():T
}
class NumberFieldBuilder extends BaseFieldBuilder<'number'>{
  getType(): 'number' {
    return 'number'
  }
}
class StringFieldBuilder extends BaseFieldBuilder<'string'>{
  getType(): 'string' {
    return 'string'
  }
}


type DataTypes = 'string' | 'number';
interface NotColumnedFieldType<T extends DataTypes> {
  dataType: T;
};
interface FieldType<T extends DataTypes> extends NotColumnedFieldType<T>{
};

type NotColumnedFieldsType = Record<string, NotColumnedFieldType<DataTypes>>;
type FieldsType = Record<string, FieldType<DataTypes>>;

// Schema 클래스
class Schema<
  Name extends string = string,
  T extends FieldsType = FieldsType
> {
  constructor(
    public id: Name,
    public field: T,
    // public orderedColumns:(keyof T)[]
  ) {}
}

// peopleMap 타입 유틸
type PeopleMap<T extends Schema[]> = {
  [K in T[number] as K['id']]: K;
};

interface CarSeatsOptions<T extends Schema[]>{people?: T}

class CarSeats<T extends Schema[]>{
  public peopleArray: T;
  public peopleMap: PeopleMap<T>;

  constructor(opts:CarSeatsOptions<T>) {
    this.peopleArray = (opts.people ?? []) as T;
    this.peopleMap = this.peopleArray.reduce((map, schema) => {
      const key = schema.id as keyof PeopleMap<T>;
      map[key] = schema as PeopleMap<T>[typeof key];
      return map;
    }, {} as PeopleMap<T>);
  }
}

interface CarOptions<T extends Schema[]> extends CarSeatsOptions<T>{}


// Car 클래스
class Car<T extends Schema[]> {
  carSeats:CarSeats<T>
  constructor(opts:CarOptions<T>){
    this.carSeats = new CarSeats(opts)
  }
}

// Road 클래스
class Road<T extends Schema[]> { // spreaedsheetClient
  constructor(public car:Car<T>) {
  }
}

// 타입 보조 함수
function makeSchema<
  Name extends string,
  T extends FieldsType
>(
  id: Name, fields: T, columnOrder?: (keyof T)[]
): Schema<Name, T> {

  // Determine the final order of columns
  const columnOrderSet = new Set<keyof T>(columnOrder);
  const fieldNames = Object.keys(fields) as (keyof T)[];
  for (const key of fieldNames) {
    columnOrderSet.add(key);
  }
  const orderedColumns = [...columnOrderSet];

  // Create the new FieldsType object with columnOrder
  // const fieldsWithOrder = {} as Record<, FieldType<T[keyof T]['dataType']>>
  const fieldsWithOrder = {} as {[K in keyof T]: FieldType<T[K]['dataType']>;}
  orderedColumns.forEach((key, idx) => {
    const notColumnedField = fields[key];
    fieldsWithOrder[key] = {
        ...notColumnedField,
        columnOrder: idx + 1
    }
  });
  
  // return new Schema(id, fieldsWithOrder, orderedColumns);
  return new Schema(id, fields);
}

// field에 메타데이터 구조 적용
// const johnField = {
//   height: { dataType: 'number' },
//   hobby: { dataType: 'string' },
// } as const;
const johnField = {
  height: testFieldBuilder.number().build(),
  hobby: testFieldBuilder.string().build(),
};

const john = makeSchema('john', johnField);

const burnoField = {
  major:testFieldBuilder.string().build()
  // major:{dataType:'string'}
}
const bruno = makeSchema('bruno', burnoField);

const people = [john, bruno];

// const road = createRoad();
const road = createSpreadsheetClient({people});

function createSpreadsheetClient<T extends Schema[]>(opts:CarOptions<T>): Road<T> {
  const car = new Car(opts);
  return new Road(car);
}
// road.car.peopleMap
road.car.carSeats.peopleMap.bruno
road.car.carSeats.peopleMap.john.field.hobby.dataType  // 'string'
