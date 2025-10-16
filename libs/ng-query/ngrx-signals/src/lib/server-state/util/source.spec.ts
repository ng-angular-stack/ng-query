function source<T>(): ((value: T) => void) & {
  listen: (callback: (value: T) => void) => void;
} {
  return Object.assign(
    {
      listen: (callback: (value: T) => void) => ({}),
    },
    (value: T) => ({})
  );
}
// function source() {
//   let callBacks = [];
//   return (value) => {
//     if (typeof value === 'function') {
//       callBacks.push(value);
//     } else {
//       callBacks.forEach((callBack) => callBack(value));
//     }
//   };
// }

describe('source', () => {
  it('should create a sateless source', () => {
    const mySource = source<{ id: string }>();

    const listenToSourceChange = mySource.listen((value) => {
      console.log('value', value);
    });

    mySource({ id: '1' });
  });
});

describe('statedSource', () => {
  it('should create a sateless source', () => {
    const mySource = statedSource({ id: string } | undefined);

    const listenToSourceChange = mySource.listen((value) => {
      console.log('value', value);
    });

    mySource({ id: '1' });
  });

  //todo unsubs
});
