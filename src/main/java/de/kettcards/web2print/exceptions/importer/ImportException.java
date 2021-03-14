package de.kettcards.web2print.exceptions.importer;

import java.io.IOException;

public class ImportException extends IOException {

    public ImportException(String message) {
        super(message);
    }

    public ImportException(Throwable throwable) {
        super(throwable);
    }

}
