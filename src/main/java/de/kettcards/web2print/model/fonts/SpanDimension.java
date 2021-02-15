package de.kettcards.web2print.model.fonts;

import lombok.Getter;

@Getter
public class SpanDimension {
    int ascender, descender, emHeight;
    float fontSizeInPoint;

    float actualClientHeight;
    public static final float LINE_HEIGHT = 1.2f;

    public SpanDimension(int ascender, int descender, int emHeight, float fontSizeInPoint){
        this.ascender = ascender;
        this.descender = descender;
        this.emHeight = emHeight;
        this.fontSizeInPoint = fontSizeInPoint;

        this.actualClientHeight = (float)(ascender - descender) / emHeight * fontSizeInPoint;
    }

    private SpanDimension(){}

    public static SpanDimension getZeroInstance(){
        var dim = new SpanDimension();
        dim.ascender = 0;
        dim.descender = 0;
        dim.emHeight = 0;
        dim.fontSizeInPoint = 0;

        dim.actualClientHeight = 0;
        return dim;
    }

    public float getFirstLineBaseline(float lineHeightFactor){
        return ( fontSizeInPoint * lineHeightFactor - actualClientHeight ) / 2f + ((float) ascender / emHeight) * fontSizeInPoint;
    }

    public float getNextLineBaseline(SpanDimension lastLineDimension, float lastLineHeightFactor, float currentLineHeightFactor){
        float firstHalfLine = ( - lastLineDimension.getAscender() + ( (lastLineDimension.getAscender() - lastLineDimension.getDescender()) / 2f))
                / lastLineDimension.getEmHeight() * lastLineDimension.getFontSizeInPoint();
        float firstBorderLine = (lastLineDimension.getFontSizeInPoint() * lastLineHeightFactor / 2f);
        float secondHalfLine = (this.getFontSizeInPoint() * currentLineHeightFactor / 2f);
        float clientUpperBorderLine = ( - this.getActualClientHeight() / 2f);
        float secondBorderLine = (float) this.getAscender()  / this.getEmHeight() * this.getFontSizeInPoint();
        return firstHalfLine + firstBorderLine + secondHalfLine + clientUpperBorderLine + secondBorderLine;
    }

}
