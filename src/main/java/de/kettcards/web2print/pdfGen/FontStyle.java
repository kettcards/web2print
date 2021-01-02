package de.kettcards.web2print.pdfGen;

public enum FontStyle {
    NONE      (0),
    BOLD      (1 << 0),
    ITALIC    (1 << 1),
    UNDERLINE (1 << 2);

    public final int Value;

    FontStyle(int value) {
        Value = value;
    }
}
