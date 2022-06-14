type ValueOf<T> = T[keyof T];
type KeysOf<T> = Array<keyof T>;
type EntryOf<T> = [keyof T, T[keyof T]];
type EntriesOf<T> = Array<EntryOf<T>>;
