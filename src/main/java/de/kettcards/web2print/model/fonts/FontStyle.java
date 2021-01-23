package de.kettcards.web2print.model.fonts;

import java.util.Collection;
import java.util.EnumSet;

public enum FontStyle {
    NONE      (0),
    BOLD      (1 << 0),
    ITALIC    (1 << 1);
    //UNDERLINE (1 << 2)

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

    public static EnumSet<FontStyle> getSet(Collection<String> flags) {
        var ret = EnumSet.noneOf(FontStyle.class);
        for (var flag : flags) {
            switch (flag) {
                case "default":
                    ret.add(NONE);
                    break;
                case "bold":
                    ret.add(BOLD);
                    break;
                case "italic":
                    ret.add(ITALIC);
                    break;
                //if Underline is needed please add case
            }
        }
        return ret;
    }

}
