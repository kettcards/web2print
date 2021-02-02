package de.kettcards.web2print.exceptions.font;

public class IllegalFontWeightException extends FontException {


    public IllegalFontWeightException(String fontName, String fontFace, int invalidWeight) {
        super(fontName, fontFace + " has invalid weight: " + invalidWeight);
    }


}
