package de.kettcards.web2print.pdf;


import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import java.io.IOException;
import java.util.List;

public class CardData {

    private final float pageWidth, pageHeight; //pt

    private final List<BoxData> innerElements;

    private final List<BoxData> outerElements;

    public static final float pageBorder = 28f; //ca. 10mm

    /**
     * @param pageWidth     page width in pt
     * @param pageHeight    page height in pt
     * @param innerElements inside nodes
     * @param outerElements outside nodes
     */
    public CardData(float pageWidth, float pageHeight, List<BoxData> innerElements, List<BoxData> outerElements) {
        this.pageWidth = pageWidth + (2 * pageBorder);
        this.pageHeight = pageHeight + (2 * pageBorder);
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
        document.setBoxOffset(pageBorder,pageBorder);

        for (var box : boxDataList) {
            //drawOutline(box,document);
            box.apply(document);
        }
        document.closeCurrentPage();
    }

    private static void drawOutline(BoxData box, Document document) throws IOException {
        var content = document.stream();
        content.setLineWidth(1);
        content.moveTo(box.getX() + document.getXOffset(), box.getY() + document.getYOffset());
        content.lineTo(box.width + box.getX() + document.getXOffset(), box.getY() + document.getYOffset());
        content.lineTo(box.width + box.getX() + document.getXOffset(), box.getY() + document.getYOffset() + box.getHeight());
        content.lineTo(box.getX() + document.getXOffset(), box.getY() + document.getYOffset() + box.getHeight());
        content.lineTo(box.getX() + document.getXOffset(), box.getY() + document.getYOffset());
        content.stroke();
    }

    private static void drawCutLine(PDPageContentStream content, PDRectangle page) throws IOException{
        float xLL = page.getLowerLeftX() + CardData.pageBorder, yLL = page.getLowerLeftY() + CardData.pageBorder, xUL = xLL, yUL = page.getHeight() - CardData.pageBorder,
                xLR = page.getWidth() - CardData.pageBorder,xUR = page.getUpperRightX() - CardData.pageBorder, yLR = yLL,yUR = page.getUpperRightY() - CardData.pageBorder;
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
