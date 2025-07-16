type WithName = { name: string };
type WithAge = { age: number };

type UserState = Partial<WithName & WithAge>;

class UserBuilder<TState extends UserState> {
  private state: TState;

  constructor(state: TState = {} as TState) {
    this.state = state;
  }

  setName(name: string): UserBuilder<TState & WithName> {
    return new UserBuilder({ ...this.state, name });
  }

  setAge(age: number): UserBuilder<TState & WithAge> {
    return new UserBuilder({ ...this.state, age });
  }

  submit(this: UserBuilder<WithName & WithAge>) {
    // Only callable when name & age are present
    return {
      success: true,
      user: this.state,
    };
  }
}

// 사용 예시
const builder = new UserBuilder();

// const validUser = builder
//   .setName('Tom')
//   .setAge(25)
//   .submit(); 

// const invalid = builder.submit(); // ❌ Error: Property 'submit' does not exist




// step wise builder pattern

class BuilderWithoutName {
  setName(name: string): BuilderWithName {
    return new BuilderWithName({ name });
  }
}

class BuilderWithName {
  constructor(private state: { name: string }) {}

  setAge(age: number): FinalBuilder {
    return new FinalBuilder({ ...this.state, age });
  }
}

class FinalBuilder {
  constructor(private state: { name: string; age: number }) {}

  submit() {
    return this.state;
  }
}

// 사용 예시
const result = new BuilderWithoutName()
  .setName("Tom")
  .setAge(30)
  .submit(); // ✅ OK

// const err = new BuilderWithoutName().submit() // ❌ 메서드 자체가 없음