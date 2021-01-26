package de.kettcards.web2print.pdfGen.cardData;

import de.kettcards.web2print.pdfGen.PDFGenerator;
import lombok.Data;
import lombok.Getter;
import lombok.Value;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import java.io.IOException;
import java.util.ArrayList;

public abstract class BoxData {
    @Getter
    protected final float xInMM, yInMM, wInMM, hInMM, xInPt, yInPt;

    public BoxData(float x, float y, float w, float h){
        xInMM = x;
        yInMM = y;
        wInMM = w;
        hInMM = h;
        xInPt = PDFGenerator.mm2pt(xInMM);
        yInPt = PDFGenerator.mm2pt(yInMM);
    }

    abstract public void applyTo(PDDocument doc, PDPageContentStream content) throws IOException;
}