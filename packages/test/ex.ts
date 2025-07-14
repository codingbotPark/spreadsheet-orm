const testFieldBuilder = {
  number:() => new NumberFieldBuilder,
  string:() => new StringFieldBuilder,
}
abstract class BaseFieldBuilder<T extends DataTypes>{
  build():FieldType<T>{
    return {dataType:this.getType(),}}
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

type FieldType<T extends DataTypes> = {
  dataType: T;
};

type FieldsType = Record<string, FieldType<DataTypes>>;

// Person 클래스
class Person<
  T extends string = string,
  F extends FieldsType = FieldsType
> {
  constructor(
    public id: T,
    public field: F
  ) {}
}

// peopleMap 타입 유틸
type PeopleMap<T extends Person[]> = {
  [K in T[number] as K['id']]: K;
};

// Car 클래스
class Car<T extends Person[]> {
  public peopleArray: T;
  public peopleMap: PeopleMap<T>;

  constructor({people}:CarOptions<T>) {
    this.peopleArray = (people ?? []) as T;
    this.peopleMap = this.peopleArray.reduce((map, person) => {
      const key = person.id as keyof PeopleMap<T>;
      map[key] = person as PeopleMap<T>[typeof key];
      return map;
    }, {} as PeopleMap<T>);
  }
}

// Road 클래스
type RoadType<T extends Person[]> = {car:Car<T>}
class Road<T extends Person[]> {
  public car: Car<T>;

  constructor(opts: RoadType<T>) {
    this.car = opts.car;
  }
}

// 타입 보조 함수
function makePerson<
  T extends string,
  F extends FieldsType
>(
  id: T, field: F
): Person<T, F> {
  return new Person(id, field);
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

const john = makePerson('john', johnField);

const burnoField = {
  major:testFieldBuilder.string().build()
  // major:{dataType:'string'}
}
const bruno = makePerson('bruno', burnoField);

const people = [john, bruno];

// const road = createRoad();
const road = createRoad({people});

interface CarOptions<T extends Person[]>{people?: T}
interface CreatRoadType<T extends Person[]> extends CarOptions<T>{}
function createRoad<T extends Person[]>({
  people,
}:CreatRoadType<T>): Road<T> {
  const car = new Car({people});
  return new Road({car});
}
// road.car.peopleMap
road.car.peopleMap.bruno
road.car.peopleMap.john.field.hobby.dataType  // 'string'
