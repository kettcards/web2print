package de.kettcards.web2print.pdfGen;

import java.util.EnumSet;

public enum FontStyle {
    NONE      (0),
    BOLD      (1 << 0),
    ITALIC    (1 << 1),
    UNDERLINE (1 << 2);

    public final int Value;

    FontStyle(int value) {
        Value = value;
    }

    public static EnumSet<FontStyle> getSet(int combined) {
        EnumSet<FontStyle> ret = EnumSet.noneOf(FontStyle.class);
        for(var style : values()) {
            if((style.Value & combined) != 0)
                ret.add(style);
        }

        return ret;
    }
}
