/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
    id: string;
}

declare module 'jszip' {
    class JSZip {
        file(filename: string, blob: Blob): void;
        generateAsync(options: { type: 'blob' }): Promise<Blob>;
    }

    export = JSZip;
}
