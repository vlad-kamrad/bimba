let activeEffect: Function | null = null;

const subscriptions: Map<
  object,
  Map<string | symbol, Set<Function>>
> = new Map();

function getSubscribersForProperty<TTarget extends object>(
  target: TTarget,
  key: string | symbol
) {
  if (!subscriptions.has(target)) {
    const targetEffects = new Map();
    targetEffects.set(key, new Set());
    subscriptions.set(target, targetEffects);
  }

  if (!subscriptions.get(target)?.has(key)) {
    subscriptions.get(target)!.set(key, new Set());
  }

  return subscriptions.get(target)!.get(key)!;
}

function track<TTarget extends object>(target: TTarget, key: string | symbol) {
  if (!activeEffect) return;

  const effects = getSubscribersForProperty(target, key);
  effects.add(activeEffect);
}

function trigger<TTarget extends object>(
  target: TTarget,
  key: string | symbol
) {
  const effects = getSubscribersForProperty(target, key);
  effects.forEach(effect => effect());
}

export function watch(callback: Function) {
  const effect = () => {
    activeEffect = effect;
    callback();
    activeEffect = null;
  };

  effect();

  return () => {
    subscriptions.forEach(subscription =>
      subscription.forEach(subEffect => subEffect.delete(effect))
    );
  };
}

export function atom<TValue>(_value: TValue): { value: TValue } {
  const obj = {
    get value() {
      track(obj, "value");
      return _value;
    },
    set value(newValue) {
      _value = newValue;
      trigger(obj, "value");
    },
  };

  return obj;
}

export function reactive<TReactive extends object>(object: TReactive) {
  return new Proxy(object, {
    set(target, key, value) {
      // @ts-ignore
      target[key] = value;
      trigger(target, key);
      return true;
    },
    get(target, key) {
      track(target, key);
      // @ts-ignore
      return target[key];
    },
  });
}

export function computed<TValue>(callback: () => TValue): { value: TValue } {
  const refObject = atom(callback());

  watch(() => {
    refObject.value = callback();
  });

  return refObject;
}
