# Bimba
### Small reactive state management library
-----

|   Function  | Description |
| ------------- | ------------- |
| `atom()`  | Used to handle changes to primitive types, to get or write a value, you should use this construct `.value`  |
| `reactive()`  | Used to store objects for further updating. Unlike an `atom()`, you do not need to use additional constructions  |
| `computed()`  | Used to keep track of dependent objects or atoms dynamically. Returns an atom with the result returned by the callback function |
| `watch()`  | Used to track all changes inside the callback function. Each time the dependencies change, the callback itself is launched. In this case, the watch function returns another function, which is used to clean up resources  |

Examples: 

#### Changes the UI depending on the change of the counter
```
import { atom, watch } from "bimba";

const count = atom(0);

setInterval(() => {
  count.value += 1;
}, 1_000);

watch(() => {
  document.querySelector("#result").textContent = count.value;
});
```

#### With disposal function

```
import { atom, watch } from "bimba";

const count = atom(0);

const timer = setInterval(() => {
  count.value += 1;
}, 1_000);

const unwatch = watch(() => {
  document.querySelector("#result").textContent = count.value;
});

document.querySelector("button", () => {
  clearInterval(timer);
  unwatch();
});

```

#### Computed values

```
import { computed, reactive } from "bimba";

const state = reactive({ a: 3, b: 2 });
const sum = computed(() => state.a + state.b);

console.log(sum.value); // 5

state.a = 10;
console.log(sum.value); // 12

state.b = 5;
console.log(sum.value); // 15

```

#### Computed values (another one example)

```
import { atom, computed } from "bimba";

class Employee {
  #salary;
  #experience;

  constructor({ experience }) {
    this.#experience = atom(experience);

    this.#salary = computed(() => {
      const years = this.#experience.value;
      if (years < 1) return 500;
      if (years < 3) return 2_000;
      if (years < 5) return 6_000;
      return 10_000;
    });
  }

  addExperience(years = 1) {
    this.#experience.value += years;
  }

  getInfo() {
    return {
      salary: this.#salary.value,
      exp: this.#experience.value,
    };
  }
}

const bob = new Employee({ experience: 2 });

console.log(bob.getInfo()); // {salary: 2000, exp: 2}

bob.addExperience(1);

console.log(bob.getInfo()); // {salary: 6000, exp: 3}

bob.addExperience(1);

console.log(bob.getInfo()); // {salary: 6000, exp: 4}

bob.addExperience(1);

console.log(bob.getInfo()); // {salary: 10000, exp: 5}

```

#### Simple TODO app

_**html:**_
```
<section>
  <h2>TODO App</h2>
    <div>
      <input class="todo-app__input" />
      <button class="todo-app__new-button">New</button>
      <div class="todo-app__error"></div>
    </div>
  <ul class="todo-app__content"></ul>
</section>
```

_**js:**_

```
import { reactive, watch } from "bimba";

const todo = {
  controls: {
    input: document.querySelector(".todo-app__input"),
    createButton: document.querySelector(".todo-app__new-button"),
    content: document.querySelector(".todo-app__content"),
    error: document.querySelector(".todo-app__error"),
  },
  refs: reactive({
    input: "",
    content: [],
    error: null,
  }),
};

// EVENTS
todo.controls.input.addEventListener("input", () => {
  todo.refs.input = todo.controls.input.value;
});

todo.controls.createButton.addEventListener("click", () => {
  const { value } = todo.controls.input;

  if (value === "") {
    todo.refs.error = "Must not be empty";
    return;
  }

  todo.refs.content = [...todo.refs.content, value];

  todo.refs.input = "";
});

// EFFECTS
watch(() => {
  todo.controls.input.value = todo.refs.input;
  todo.refs.error = null;
});

watch(() => {
  const { content: contentElement } = todo.controls;

  while (contentElement.lastElementChild) {
    contentElement.removeChild(contentElement.lastElementChild);
  }

  todo.refs.content.map(item => {
    const todoElement = document.createElement("li");

    todoElement.textContent = item;

    contentElement.appendChild(todoElement);
  });
});

watch(() => {
  todo.controls.error.textContent = todo.refs.error;
});

```
