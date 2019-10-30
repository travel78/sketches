 getBase64Obs(file): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            let encoded = (reader.result as string).replace(/^data:(.*;base64,)?/, '');
            if ((encoded.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            observer.next(encoded);
            observer.complete();
        };
        reader.onerror = function (error) {
            observer.error(error);
            observer.complete();
        };
    });
}
