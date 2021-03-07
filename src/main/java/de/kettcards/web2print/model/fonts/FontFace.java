package de.kettcards.web2print.model.fonts;

import org.apache.fontbox.ttf.TTFParser;
import org.apache.fontbox.ttf.TrueTypeFont;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.util.EnumSet;
import java.util.Objects;

public final class FontFace {

    private final EnumSet<FontStyle> fontStyle;

    private final int fontWeight;

    private final float lineHeight;

    private final String source;

    private TrueTypeFont font;

    public FontFace(EnumSet<FontStyle> fontStyle, int fontWeight, float lineHeight, String source) {
        this(fontStyle, fontWeight, lineHeight, source, null);
    }

    public FontFace(EnumSet<FontStyle> fontStyle, int fontWeight, float lineHeight, String source, TrueTypeFont trueTypeFont) {
        this.fontStyle = fontStyle;
        this.fontWeight = fontWeight;
        this.lineHeight = lineHeight;
        this.source = source;
        this.font = trueTypeFont;
    }

    public boolean isLoaded() {
        return font != null;
    }

    public void load(InputStream inputStream) throws IOException, NoSuchFieldException, IllegalAccessException, InvocationTargetException, NoSuchMethodException {
        font = new TTFParser().parse(inputStream);
        String tags = "aalt abvf abvm abvs afrc akhn blwf blwm blws calt case ccmp cfar chws cjct clig cpct cpsp cswh curs c2pc c2sc dist dlig dnom dtls expt falt fin2 fin3 fina flac frac fwid half haln halt hist hkna hlig hngl hojo hwid init isol ital jalt jp78 jp83 jp90 jp04 kern lfbd liga ljmo lnum locl ltra ltrm mark med2 medi mgrk mkmk mset nalt nlck nukt numr onum opbd ordn ornm palt pcap pkna pnum pref pres pstf psts pwid qeid rand rclt rkrf rlig rphf rtbd rtla rtlm ruby rvrn salt sinf size smcp smpl ssty stch subs sups swsh titl tjmo tnam tnum trad twid unic valt vatu vchw vert vhal vjmo vkna vkrn vpal vrt2 vrtr zero";
        for(int i = 1; i < 100; i++){
            tags = tags + " cv" + String.format("%02d", i);
        }
        tags = tags + " ss01 ss02 ss03 ss04 ss05 ss06 ss07 ss08 ss09 ss10 ss11 ss12 ss13 ss14 ss15 ss16 ss17 ss18 ss19 ss20";

        for (String str : tags.split(" "))
        {
            font.enableGsubFeature(str);
        }
    }

    public PDFont embed(PDDocument pdDocument) throws IOException {
            return PDType0Font.load(pdDocument, font, true);
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FontFace) {
            return obj.hashCode() == this.hashCode();
        }
        return false;
    }

    @Override
    public int hashCode() {
        return Objects.hash(fontStyle);
    }

    public EnumSet<FontStyle> getFontStyle() {
        return fontStyle;
    }

    public int getFontWeight() {
        return fontWeight;
    }

    public float getLineHeight() {
        return lineHeight;
    }

    public String getSource() {
        return source;
    }

    public TrueTypeFont getFont() { return font; }

}
