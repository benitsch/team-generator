export default class ContainerUtils {

 static shuffleArray(array: Array<any>): void {
    array.sort(() => Math.random() - 0.5);
 }

 static groupElementsByProperty<KeyType>(array: Array<any>, propertyFn: (value: any) => KeyType): Map<KeyType, Array<any>> {
    const mapping: Map<KeyType, Array<any>> = new Map<KeyType, Array<any>>();
    for (const value of array){
        const key: KeyType = propertyFn(value);
        if (mapping.has(key)){
            mapping.get(key)?.push(value);
        }else{
            mapping.set(key, [value]);
        }
    }
    return mapping;
 }

 static sortMapDescendingByKey(map: Map<number, any>): void {
    const  descendingComparer= (pairA: [number, any], pairB: [number, any]): number => {return pairB[0] - pairA[0]};
    const sortedMap: Map<number, any> = new Map<number, any>([...map].sort(descendingComparer));
    map = sortedMap;
 }

}