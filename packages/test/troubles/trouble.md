### 1. defineSchema 에서 assert 로 Schema<Name, FieldsType>; 
해주지 않으면 좁은 키 집합을 가진(definedSchema)를 넓은 키값(FieldsType)에 할당하려 해서 타입에러 발생한다.

### 2. queryBuilder 에서 두 가지 방법으로 메서드를 제한하려 했는데
1. 제네릭 기반으로 execute 메서드 실행에 클레스와 제네릭을 함께 요구(힌팅이 뜨지만, 사용하려하면 타입에러가 뜸)
코드가 간단하지만, 힌팅이 뜨는게 불편함

2. step-wise 방법으로 sheetName 설정 메서드 이후에 execute 메서드를 가진 클래스를 반환(힌팅자체가 안뜸)
코드가 길어지지만, 힌팅이 안떠서 구현했는데, Andable로직 구현(mixin패턴이라)에 어려움


