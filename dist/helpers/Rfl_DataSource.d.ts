export declare class Rfl_DataSource {
    private static _fetchApiData;
    private static _extractLocalOptions;
    private static _getRemoteOptions;
    private static debouncedFetch;
    static _fetchRemoteData: (url: string, params?: string[] | null, authorized?: boolean, authToken?: string | null, setDebounce?: boolean) => Promise<any>;
    static _fetchOptionsData: (obj: any, dataFormat: any, parent?: string | null, authToken?: string | null) => Promise<any>;
}
