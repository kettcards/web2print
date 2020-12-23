package de.kettcards.web2print.pdfGen;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class PdfGenTest {

    public static void main(String[] args) throws Exception {

        PDDocument doc = new PDDocument();
        PDRectangle pdr1 = new PDRectangle(mm2pt(400.0f), mm2pt(300.0f));
        PDPage page1 = new PDPage(pdr1);
        doc.addPage(page1);
        System.out.println(pdr1.getWidth() + ";" + pdr1.getHeight());

        PDRectangle pdr2 = new PDRectangle(mm2pt(200.0f), mm2pt(400.0f));
        PDPage page2 = new PDPage(pdr2);
        doc.addPage(page2);
        System.out.println(pdr2.getWidth() + ";" + pdr2.getHeight());

        HashMap<FontStyle,String> textStyle = new HashMap<>();
        textStyle.put(FontStyle.BOLD,"This");
        textStyle.put(FontStyle.ITALIC,"is");
        textStyle.put(FontStyle.UNDERLINE,"a");
        textStyle.put(FontStyle.NONE,"test");

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
            contentStream.setLeading(mm2pt(10.0f));
            contentStream.newLineAtOffset(300,300);
            contentStream.showText("1. This is a text at x:300 and y:300");
            contentStream.newLine();
            contentStream.showText("2. This is a text at newLine");
            //contentStream.newLineAtOffset(20,250);
            contentStream.newLineAtOffset(200, 200);
            contentStream.showText("3. This is a text at x:200 and y:200");
            contentStream.newLine();
            contentStream.showText("4. This is a text at newLine");
            contentStream.endText();

        } catch (IOException ex) {
            ex.printStackTrace();
        }

        try(PDPageContentStream content = new PDPageContentStream(doc, page2)){
            content.beginText();
            String output = "";
            for(Map.Entry<FontStyle,String> entry : textStyle.entrySet()){
                switch(entry.getKey()){
                    case BOLD:

                        break;
                    case ITALIC:
                        break;
                    case UNDERLINE:
                        break;
                    case NONE:
                        break;
                    default:
                        break;
                }
            }
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