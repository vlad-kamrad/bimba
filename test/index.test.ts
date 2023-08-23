import { atom, computed, reactive, watch } from "../src/index";

describe("Atom", () => {
  test("Primitives", () => {
    const count = atom(0);

    count.value += 1;
    expect(count.value).toBe(1);

    count.value *= 2;
    expect(count.value).toBe(2);

    count.value = 10;
    expect(count.value).toBe(10);
  });

  test("Arrays", () => {
    const array = atom<number[]>([]);

    array.value = [...array.value, 1];
    expect(array.value.length).toBe(1);

    array.value = [...array.value, 2];
    expect(array.value.length).toBe(2);

    array.value = [];
    expect(array.value.length).toBe(0);
  });
});

describe("Computed", () => {
  test("Primitives", () => {
    const A = atom(0);
    const B = atom(0);

    const sum = computed(() => A.value + B.value);

    expect(sum.value).toBe(0);

    A.value = 4;
    expect(sum.value).toBe(4);

    B.value = 6;
    expect(sum.value).toBe(10);

    A.value = 100;
    B.value = 10;
    expect(sum.value).toBe(110);
  });

  test("Arrays", () => {
    const arr1 = atom<number[]>([10, 5, 1]);
    const arr2 = atom<number[]>([3, 7]);

    const sortedArray = computed(() => {
      const result = [...arr1.value, ...arr2.value];

      result.sort((a, b) => a - b);

      return result;
    });

    expect(JSON.stringify(sortedArray.value)).toBe("[1,3,5,7,10]");

    arr1.value = [2, 5];
    expect(JSON.stringify(sortedArray.value)).toBe("[2,3,5,7]");

    arr1.value = [10, 0];
    arr2.value = [5, -5];
    expect(JSON.stringify(sortedArray.value)).toBe("[-5,0,5,10]");
  });
});

describe("Watch", () => {
  test("Atom changes", () => {
    let expexted = 0;
    const count = atom(0);

    watch(() => {
      expect(count.value).toBe(expexted);
    });

    expexted = 1;
    count.value += 1;

    expexted = 3;
    count.value += 2;
  });

  test("Reactive changes", () => {
    const user = reactive({
      name: "Joe",
      age: 19,
    });

    const expexted = { name: "Joe", age: 19 };

    watch(() => {
      expect(user.name).toBe(expexted.name);
      expect(user.age).toBe(expexted.age);
    });

    expexted.age = 25;
    user.age = 25;

    expexted.name = "Lisa";
    user.name = "Lisa";
  });

  test("Computed changes", () => {
    const A = atom(0);
    const B = atom(0);

    let expexted = 0;
    const sum = computed(() => A.value + B.value);

    watch(() => {
      expect(sum.value).toBe(expexted);
    });

    expexted = 2;
    A.value = 2;

    expexted = 5;
    B.value = 3;

    expexted = 8;
    B.value = 6;

    expexted = 10;
    A.value = 4;
  });
});
