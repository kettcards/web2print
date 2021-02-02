package de.kettcards.web2print.exceptions.font;

public class IllegalFontStyleException extends FontException {

    public IllegalFontStyleException(String message) {
        super("unknown font style:" + message);
    }

    public IllegalFontStyleException(String packageName, String style) {
        super(packageName, "unknown font style: " + style);
    }
}
