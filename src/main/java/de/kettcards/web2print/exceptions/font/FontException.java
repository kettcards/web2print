package de.kettcards.web2print.exceptions.font;

import java.io.IOException;

public class FontException extends IOException {

    public FontException() {

    }

    public FontException(String message) {
        super(message);
    }

    public FontException(Throwable cause) {
        super(cause);
    }

    public FontException(String packageName, String message) {
        this("unable to use font package \"" + packageName + "\": " + message);
    }

}
