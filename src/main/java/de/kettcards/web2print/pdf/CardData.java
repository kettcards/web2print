package de.kettcards.web2print.pdf;


import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import java.io.IOException;
import java.util.List;

public class CardData {

    private final float pageWidth, pageHeight; //pt

    private final List<BoxData> innerElements;

    private final List<BoxData> outerElements;

    public static final float PAGE_BORDER = 28f; //ca. 10mm

    /**
     * @param pageWidth     page width in pt
     * @param pageHeight    page height in pt
     * @param innerElements inside nodes
     * @param outerElements outside nodes
     */
    public CardData(float pageWidth, float pageHeight, List<BoxData> innerElements, List<BoxData> outerElements) {
        this.pageWidth = pageWidth + (2 * PAGE_BORDER);
        this.pageHeight = pageHeight + (2 * PAGE_BORDER);
        this.innerElements = innerElements;
        this.outerElements = outerElements;
    }

    /**
     * appends a new page inside the given document,
     * writes box data nodes to newly created page
     *
     * @param document    document
     * @param boxDataList box data nodes
     * @param width       page width
     * @param height      page height
     * @throws IOException if document page can't be correctly created
     */
    public static void createPageWith(Document document, List<BoxData> boxDataList, float width, float height) throws IOException {
        document.newPage(width, height);
        drawCutLine(document.stream(), document.page().getMediaBox());
        document.setBoxOffset(PAGE_BORDER, PAGE_BORDER);

        for (var box : boxDataList) {
            box.apply(document);
        }
        document.closeCurrentPage();
    }

    /**
     * this will draw on each corner a cutline mark according the wishes of KettCards. If you want a custom cutline or even no cutline, make sure to remove the call for this method
     * @param content
     * @param page
     * @throws IOException
     */
    private static void drawCutLine(PDPageContentStream content, PDRectangle page) throws IOException{
        float xLL = page.getLowerLeftX() + CardData.PAGE_BORDER, yLL = page.getLowerLeftY() + CardData.PAGE_BORDER, xUL = xLL, yUL = page.getHeight() - CardData.PAGE_BORDER,
                xLR = page.getWidth() - CardData.PAGE_BORDER,xUR = page.getUpperRightX() - CardData.PAGE_BORDER, yLR = yLL,yUR = page.getUpperRightY() - CardData.PAGE_BORDER;
        content.setLineWidth(1);
        content.moveTo(xLL,0);
        content.lineTo(xLL,yLL - 5);
        content.moveTo(0,yLL);
        content.lineTo(xLL - 5,yLL);
        content.moveTo(xUL,page.getHeight());
        content.lineTo(xUL,yUL  + 5);
        content.moveTo(0,yUL);
        content.lineTo(xUL - 5,yUL);
        content.moveTo(xLR,0);
        content.lineTo(xLR, yLR - 5);
        content.moveTo(page.getWidth(),yLR);
        content.lineTo(xLR + 5,yLR);
        content.moveTo(xUR,page.getHeight());
        content.lineTo(xUR,yUR + 5);
        content.moveTo(page.getWidth(),yUR);
        content.lineTo(xUR + 5,yUR);
        content.stroke();
    }

    /**
     * applies card data to given document
     *
     * @param document document
     * @throws IOException if card data can't be applied to document
     */
    public void apply(Document document) throws IOException {
        createPageWith(document, innerElements, pageWidth, pageHeight);
        if (!outerElements.isEmpty())
            createPageWith(document, outerElements, pageWidth, pageHeight);
    }

}
