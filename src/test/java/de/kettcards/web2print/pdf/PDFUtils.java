package de.kettcards.web2print.pdf;

import org.apache.pdfbox.pdmodel.PDPageContentStream;

import java.io.IOException;

public class PDFUtils {

    private void drawOutline(PDPageContentStream stream, BoxData boxData) throws IOException {
        stream.setLineWidth(1);
        stream.moveTo(boxData.getX(), boxData.getY());
        stream.lineTo(boxData.getWidth(), boxData.getY());
        stream.lineTo(boxData.getWidth(), boxData.getY() - boxData.getHeight());
        stream.lineTo(boxData.getX(), boxData.getY() - boxData.getHeight());
        stream.lineTo(boxData.getX(), boxData.getY());
        stream.stroke();
    }

}
