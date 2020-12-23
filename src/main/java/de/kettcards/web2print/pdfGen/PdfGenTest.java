package de.kettcards.web2print.pdfGen;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.File;
import java.io.IOException;

public class PdfGenTest {

    public static void main(String[] args) throws Exception {

        PDDocument doc = new PDDocument();
        PDRectangle pdr1 = new PDRectangle(mm2pt(400.0f), mm2pt(300.0f));
        PDPage page1 = new PDPage(pdr1); //erstellt eine Seite die 400mm x 300mm gross ist
        doc.addPage(page1);
        System.out.println(pdr1.getWidth() + ";" + pdr1.getHeight());

        PDRectangle pdr2 = new PDRectangle(mm2pt(200.0f), mm2pt(400.0f));
        PDPage page2 = new PDPage(pdr2);
        doc.addPage(page2);
        System.out.println(pdr2.getWidth() + ";" + pdr2.getHeight());


        try (PDPageContentStream contentStream = new PDPageContentStream(doc, page1)) {
            /*
            contentStream.beginText();
            PDTrueTypeFont.load();
            PDTrueTypeFont.loadTTF();
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.setLeading(2f);
            contentStream.newLineAtOffset(100 * 23, 144);
            contentStream.showText("This is a very basic test");
            Object[] array = { "ok", 32f, 43f, "boomer"};
            contentStream.showTextWithPositioning(array);
            contentStream.endText();
             */
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 14);
            contentStream.setLeading(2f);
            contentStream.newLineAtOffset(20,30);
            for(int i = 0 ; i < 100; i+=20){
                contentStream.newLineAtOffset(0, i);
                //contentStream.newLine();

                contentStream.showText(String.format("Diese Seite ist %f mm x %f mm groß.", pt2mm(pdr1.getWidth()), pt2mm(pdr1.getHeight())));
            }
            contentStream.newLineAtOffset(0, 55);
            contentStream.endText();

        } catch (IOException ex) {
            ex.printStackTrace();
        }

        try(PDPageContentStream content = new PDPageContentStream(doc, page2)){
            content.beginText();
            content.setFont(PDType1Font.TIMES_ROMAN, 12);

            content.endText();
        }catch (IOException ex) {
            ex.printStackTrace();
        }

        doc.save(new File("document.pdf"));


    }


    public static float mm2pt(float value){
        return value / 25.4f * 72.0f;
    }

    public static float pt2mm(float value){
        return value * 25.4f / 72.0f;
    }
}