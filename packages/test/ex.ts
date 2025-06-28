
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
    public name: string,
    public age: number,
    public field: F
  ) {}
}

// peopleMap 타입 유틸
type PeopleMap<T extends { id: string }[]> = {
  [K in T[number] as K['id']]: K;
};

// Car 클래스
class Car<T extends { id: string }[]> {
  public peopleArray: T;
  public peopleMap: PeopleMap<T>;

  constructor(people: T) {
    this.peopleArray = people;
    this.peopleMap = people.reduce((map, person) => {
      const key = person.id as keyof PeopleMap<T>;
      map[key] = person as PeopleMap<T>[typeof key];
      return map;
    }, {} as PeopleMap<T>);
  }
}

// Road 클래스
class Road<T extends { id: string }[]> {
  public car: Car<T>;

  constructor(car: Car<T>) {
    this.car = car;
  }
}

// 타입 보조 함수
function makePerson<
  T extends string,
  F extends FieldsType
>(id: T, name: string, age: number, field: F): Person<T, F> {
  return new Person(id, name, age, field);
}

// field에 메타데이터 구조 적용
const johnField = {
  height: { dataType: 'number' },
  hobby: { dataType: 'string' },
} as const;

const john = makePerson('john', 'John', 30, johnField);

const people = [john];

const road = createRoad(people);

function createRoad<T extends Person[] = []>(
  people?: T
): Road<T> {
  const actualPeople = (people ?? []) as T;
  const car = new Car(actualPeople);
  return new Road(car);
}
road.car.peopleMap.john
road.car.peopleMap.john.field.hobby.dataType  // 'string'
