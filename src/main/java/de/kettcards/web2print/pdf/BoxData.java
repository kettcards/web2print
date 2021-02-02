package de.kettcards.web2print.pdf;

import lombok.Getter;

import java.io.IOException;

/**
 * abstract representation for page element
 */
public abstract class BoxData {

    @Getter
    protected final float x, y, width, height;

    /**
     *
     * @param x x cord in pt
     * @param y y cord in pt
     * @param width width in pt
     * @param height height in pt
     */
    public BoxData(float x, float y, float width, float height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * applies box data to the given document
     * @param doc document
     * @throws IOException if box data cant be applied to document
     */
    public abstract void apply(Document doc) throws IOException;

}
