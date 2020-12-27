package de.kettcards.web2print.pdfGen;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PDFGenerator {

    public static void main(String[] args) {

        PDDocument doc = null;
        try{
            doc = new PDDocument();

            //User Story 015 "PDF Generator - Seitenformat"
            float pageX = mm2pt(400.0f), pageY = mm2pt(300.0f);

            PDRectangle pdr1 = new PDRectangle(pageX,pageY);
            PDPage page1 = new PDPage(pdr1);
            doc.addPage(page1);

            //User Story 016 "PDF Generator - Text, Positionierung"
            pageX = mm2pt(150.0f);
            pageY = mm2pt(200.0f);

            PDRectangle pdr2 = new PDRectangle(pageX,pageY);
            PDPage page2 = new PDPage(pdr2);
            doc.addPage(page2);

            PDPageContentStream contentStream = new PDPageContentStream(doc, page2);

            PDFont font = PDType1Font.HELVETICA;
            float fontSize = 12.0f;
            float leading = 1.5f * fontSize;

            contentStream.beginText();

            contentStream.setFont(font, fontSize);
            contentStream.setLeading(leading);
            contentStream.newLineAtOffset(mm2pt(20.0f),pageY-100);
            contentStream.showText("Diese Zeile ist auf X: " + mm2pt(20.0f) + ";Y: " + (pageY-100));
            contentStream.newLine();
            contentStream.showText("Diese Zeile ist eins drunter mit einem Zeilenabstand von " + leading);
            contentStream.newLineAtOffset(0, -mm2pt(20.0f));
            contentStream.showText("Diese Zeile ist 20mm unter der vorherigen Zeile");
            contentStream.endText();

            contentStream.close();

            //User Story 019 "PDF Generator - Text, Schriftart"
            pageX = mm2pt(200.0f);
            pageY = mm2pt(200.0f);

            PDRectangle pdr3 = new PDRectangle(pageX,pageY);
            PDPage page3 = new PDPage(pdr3);
            doc.addPage(page3);

            PDPageContentStream content = new PDPageContentStream(doc, page3);

            fontSize = 12.0f;
            leading = 1.5f * fontSize;
            content.setLeading(leading);

            HashMap<FontStyle,String> textStyle = new HashMap<>();
            textStyle.put(FontStyle.BOLD,"Bold");
            textStyle.put(FontStyle.ITALIC,"Italic");
            textStyle.put(FontStyle.NONE,"None");

            content.beginText();
            content.newLineAtOffset(mm2pt(10.0f), pageY - 20);

            for(Map.Entry<FontStyle,String> entry : textStyle.entrySet()){
                switch(entry.getKey()){
                    case BOLD:
                        font = PDType1Font.HELVETICA_BOLD;
                        content.setFont(font, fontSize);
                        content.showText(entry.getValue() + " ");
                        break;
                    case ITALIC:
                        font = PDType1Font.TIMES_ITALIC;
                        content.setFont(font, fontSize);
                        content.showText(entry.getValue() + " ");
                        break;
                        // noch keine Fonts gefunden die Underline kann
                    //case UNDERLINE:
                        //break;
                    case NONE:
                        font = PDType1Font.HELVETICA;
                        content.setFont(font, fontSize);
                        content.showText(entry.getValue() + " ");
                        break;
                    default:
                        content.showText(entry.getValue() + " ");
                        break;
                }
            }

            content.endText();
            content.close();


            doc.save(new File("document.pdf"));

        }catch (IOException e) {
            e.printStackTrace();
        }finally {
            if(doc != null){
                try {
                    doc.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }


    /**
     * converts mm to pt
     * @param value in mm
     * @return value in pt
     */
    public static float mm2pt(float value){
        return value / 25.4f * 72.0f;
    }

    /**
     * converts pt to mm
     * @param value in pt
     * @return value in mm
     */
    public static float pt2mm(float value){
        return value * 25.4f / 72.0f;
    }
}