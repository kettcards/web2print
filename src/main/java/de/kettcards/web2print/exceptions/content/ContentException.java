package de.kettcards.web2print.exceptions.content;

import java.io.IOException;

public class ContentException extends IOException {

    public ContentException() {
    }

    public ContentException(String message) {
        super(message);
    }

    public ContentException(String message, Throwable cause) {
        super(message, cause);
    }

    public ContentException(Throwable cause) {
        super(cause);
    }
}
