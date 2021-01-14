package de.kettcards.web2print;

import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.pdfGen.*;
import de.kettcards.web2print.pdfGen.cardData.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.EnumSet;
import java.util.function.Function;

class PdfGenTests {
    static final int CURRENT_FORMAT_VERSION = 0;

    @BeforeAll
    static void Init() throws IOException {
        var path = Path.of("./test_output");
        if (!Files.exists(path))
            Files.createDirectory(path);
        else
            for (var file : path.toFile().listFiles()) {
                file.delete();
            }
    }

    static File GetOutputFile() {
        var stacktrace = Thread.currentThread().getStackTrace();
        var methodName = stacktrace[2].getMethodName();
        return new File("./test_output/" + methodName + ".pdf");
    }

    static Function<String, CardFormat> DummyProvider = s -> {
        var format = new CardFormat();
        format.setWidth(210);
        format.setHeight(290);
        return format;
    };

    @Test
        //US015 - "PDF Generator - Seitenformat"
    void freePageDims() throws IOException {
        var data = new CardData(CURRENT_FORMAT_VERSION, 400, 300);
        var doc = new PDDocument();
        PDFGenerator.ApplyTo(doc, data);
        doc.save(GetOutputFile());
    }

    static TextRunData makeDefaultTextRun(String text) {
        return makeDefaultTextRun(EnumSet.of(FontStyle.NONE), text);
    }

    static TextRunData makeDefaultTextRun(EnumSet<FontStyle> attributes, String text) {
        var font = new Font(PDType1Font.HELVETICA, PDType1Font.HELVETICA_BOLD, PDType1Font.HELVETICA_OBLIQUE, PDType1Font.HELVETICA_BOLD_OBLIQUE);
        return new TextRunData(font, 12, attributes, text);
    }

    @Test
        //US016 - "PDF Generator - Text, Positionierung"
    void freeTextPositioning() throws IOException {
        var data = new CardData(CURRENT_FORMAT_VERSION, 150, 200);
        var box = new TextBoxData(20, data.getPageHeight() - 100, -1, -1, 'l');
        box.getTextRuns().add(makeDefaultTextRun("Diese Zeile ist auf X: " + box.getX() + ";Y: " + box.getY()));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeDefaultTextRun("Zeile 2"));
        data.getTextBoxes().add(box);

        var doc = new PDDocument();
        PDFGenerator.ApplyTo(doc, data);
        doc.save(GetOutputFile());
    }

    @Test
        //US019 - "PDF Generator - Text, Schriftart"
    void customTextFont() throws IOException {
        var data = new CardData(CURRENT_FORMAT_VERSION, 200, 200);
        var box = new TextBoxData(10, data.getPageWidth() - 20, -1, -1, 'l');
        for (var attribute : FontStyle.values()) {
            box.getTextRuns().add(makeDefaultTextRun(EnumSet.of(attribute), attribute.toString()));
            box.getTextRuns().add(makeDefaultTextRun(" "));
        }
        box.getTextRuns().add(TextRunData.LineBreak);

        box.getTextRuns().add(makeDefaultTextRun(EnumSet.of(FontStyle.BOLD, FontStyle.ITALIC), "BOLD_ITALIC"));
        box.getTextRuns().add(makeDefaultTextRun(" "));
        box.getTextRuns().add(makeDefaultTextRun(EnumSet.of(FontStyle.BOLD, FontStyle.UNDERLINE), "BOLD_UNDERLINE"));
        box.getTextRuns().add(TextRunData.LineBreak);

        box.getTextRuns().add(makeDefaultTextRun(EnumSet.of(FontStyle.BOLD, FontStyle.ITALIC, FontStyle.UNDERLINE), "BOLD_ITALIC_UNDERLINE"));

        data.getTextBoxes().add(box);

        var doc = new PDDocument();
        PDFGenerator.ApplyTo(doc, data);
        doc.save(GetOutputFile());
    }

    static TextRunData makeCustomTextRun(PDDocument doc, File[] fonts, int fontSize, EnumSet<FontStyle> attributes, String text) throws IOException {
        var font = new Font.Provider("test", fonts[0], fonts[1], fonts[2], fonts[3]);
        return new TextRunData(font.load(doc), fontSize, attributes, text);
    }

    @Test
        //US019 - "PDF Generator - Text, Schriftart"
    void customTextFontFromFile() throws IOException {
        var doc = new PDDocument();

        var data = new CardData(CURRENT_FORMAT_VERSION, 200, 200);
        var box = new TextBoxData(10, data.getPageWidth() - 20, -1, -1, 'l');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };
        for (var attribute : FontStyle.values()) {
            box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(attribute), attribute.toString()));
            box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), " "));
        }

        data.getTextBoxes().add(box);

        PDFGenerator.ApplyTo(doc, data);
        doc.save(GetOutputFile());
    }

    @Test
    void multipleSize() throws IOException{
        var doc = new PDDocument();

        var data = new CardData(CURRENT_FORMAT_VERSION, 200, 200);
        var box = new TextBoxData(10, data.getPageWidth() - 20, -1, -1, 'l');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };
        for (var attribute : FontStyle.values()) {
            box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(attribute), attribute.toString()));
            box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), " "));
        }
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "This is a "));
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 28, EnumSet.of(FontStyle.NONE), "Giant"));
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), " in this Line!"));

        data.getTextBoxes().add(box);
        PDFGenerator.ApplyTo(doc, data);
        doc.save(GetOutputFile());
    }

    @Test
    void underline() throws IOException {
        var doc = new PDDocument();

        var data = new CardData(CURRENT_FORMAT_VERSION, 200, 200);
        var box = new TextBoxData(10, data.getPageWidth() - 20, -1, -1, 'l');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };
        for (var attribute : FontStyle.values()) {
            box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(attribute), attribute.toString()));
            box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), " "));
        }
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.UNDERLINE), "This Text is Underlined"));

        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.UNDERLINE), "This"));
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), " is underlined and "));
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.UNDERLINE), "This"));

        data.getTextBoxes().add(box);

        PDFGenerator.ApplyTo(doc, data);
        doc.save(GetOutputFile());
    }

    @Test
    void multiSizeAndUnderline() throws IOException{
        var doc = new PDDocument();
        var data = new CardData(CURRENT_FORMAT_VERSION,200,200);
        var box = new TextBoxData(5, data.getPageHeight() - 20, -1,-1, 'l');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };

        box.getTextRuns().add(makeCustomTextRun(doc,customFont,12,EnumSet.of(FontStyle.NONE), "Lorem ipsum dolor "));
        box.getTextRuns().add(makeCustomTextRun(doc,customFont,28,EnumSet.of(FontStyle.BOLD), "sit amet,"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc,customFont,12,EnumSet.of(FontStyle.UNDERLINE), " consectetur "));
        box.getTextRuns().add(makeCustomTextRun(doc,customFont,8,EnumSet.of(FontStyle.ITALIC), "testestestest "));
        box.getTextRuns().add(makeCustomTextRun(doc,customFont,28,EnumSet.of(FontStyle.UNDERLINE), "adipiscing "));
        box.getTextRuns().add(makeCustomTextRun(doc,customFont,8,EnumSet.of(FontStyle.ITALIC), "elit. Suspendisse ut."));

        data.getTextBoxes().add(box);
        PDFGenerator.ApplyTo(doc,data);
        doc.save(GetOutputFile());
    }

    @Test
    void rightAlignment() throws IOException{
        var doc = new PDDocument();
        var data = new CardData(CURRENT_FORMAT_VERSION, 100, 50);
        var box = new TextBoxData(5, data.getPageHeight() -10, data.getPageBounds().getWidth()-PDFGenerator.mm2pt(10f),-1,'r');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Lorem ipsum dolor sit amet,"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "consectetur adipiscing elit."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Nullam posuere eu risus in lobortis."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Praesent eu faucibus lacus, ut cursus."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Lorem ipsum dolor sit amet,"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "consectetur adipiscing elit."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Nullam posuere eu risus in lobortis."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Praesent eu faucibus lacus, ut cursus."));
        box.getTextRuns().add(TextRunData.LineBreak);

        data.getTextBoxes().add(box);
        PDFGenerator.ApplyTo(doc,data);
        doc.save(GetOutputFile());
    }

    @Test
    void centerAlignment() throws IOException{
        var doc = new PDDocument();
        var data = new CardData(CURRENT_FORMAT_VERSION, 200, 200);
        var box = new TextBoxData(5, data.getPageHeight() -20, data.getPageBounds().getWidth()-PDFGenerator.mm2pt(25f),-1,'c');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };

        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Lorem ipsum dolor sit amet,"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "consectetur adipiscing elit."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Nullam posuere eu risus in lobortis."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Praesent eu faucibus lacus, ut cursus."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Lorem ipsum dolor sit amet,"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "consectetur adipiscing elit."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Nullam posuere eu risus in lobortis."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(FontStyle.NONE), "Praesent eu faucibus lacus, ut cursus."));
        box.getTextRuns().add(TextRunData.LineBreak);

        data.getTextBoxes().add(box);
        PDFGenerator.ApplyTo(doc,data);
        doc.save(GetOutputFile());
    }

    @Test
    void justifyAlignment() throws IOException{
        var doc = new PDDocument();
        var data = new CardData(CURRENT_FORMAT_VERSION, 100, 50);
        var box = new TextBoxData(5, data.getPageHeight() -10, data.getPageBounds().getWidth()-PDFGenerator.mm2pt(10f),-1,'j');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };

        box.getTextRuns().add(makeDefaultTextRun("Lorem ipsum dolor sit amet, consecteturs"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeDefaultTextRun("posuere eus risus in lobortis. consecteturs"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeDefaultTextRun("Praesent eu faucibus lacus, ut cursus. ipsum"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeDefaultTextRun("sit amet, consecteturs adipiscings elit."));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeDefaultTextRun("Nullam posuere eu risus in lobortis. Praesent"));
        box.getTextRuns().add(TextRunData.LineBreak);
        box.getTextRuns().add(makeDefaultTextRun("eu faucibus lacus, ut cursus."));
        box.getTextRuns().add(TextRunData.LineBreak);

        data.getTextBoxes().add(box);
        PDFGenerator.ApplyTo(doc,data);
        doc.save(GetOutputFile());
    }

    @Test
    void justifyEdgeCase() throws IOException{
        var doc = new PDDocument();
        var data = new CardData(CURRENT_FORMAT_VERSION, 100, 50);
        var box = new TextBoxData(5, data.getPageHeight() -10, data.getPageBounds().getWidth()-PDFGenerator.mm2pt(10f),-1,'j');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };

        box.getTextRuns().add(makeDefaultTextRun("Lorem ipsum "));
        box.getTextRuns().add(makeDefaultTextRun("dolor sit "));
        box.getTextRuns().add(makeDefaultTextRun("amet, consecteturs "));
        box.getTextRuns().add(makeDefaultTextRun("elit. Nullam"));

        data.getTextBoxes().add(box);
        PDFGenerator.ApplyTo(doc,data);
        doc.save(GetOutputFile());
    }

    @Test
    void alignments() throws IOException{
        var doc = new PDDocument();
        var data = new CardData(CURRENT_FORMAT_VERSION, 200, 200);
        var boxL = new TextBoxData(5, data.getPageHeight() -20, data.getPageBounds().getWidth()-PDFGenerator.mm2pt(25f),-1,'l');

        File[] customFont = {
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),
                new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")
        };

        for (var attribute : FontStyle.values()) {
            boxL.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(attribute), attribute.toString()));
            boxL.getTextRuns().add(TextRunData.LineBreak);
        }

        data.getTextBoxes().add(boxL);

        var boxR = new TextBoxData(5, data.getPageHeight() -50, data.getPageBounds().getWidth()-PDFGenerator.mm2pt(25f),-1,'r');

        for (var attribute : FontStyle.values()) {
            boxR.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(attribute), attribute.toString()));
            boxR.getTextRuns().add(TextRunData.LineBreak);
        }

        data.getTextBoxes().add(boxR);

        var boxC = new TextBoxData(5, data.getPageHeight() -80, data.getPageBounds().getWidth()-PDFGenerator.mm2pt(25f),-1,'c');

        for (var attribute : FontStyle.values()) {
            boxC.getTextRuns().add(makeCustomTextRun(doc, customFont, 12, EnumSet.of(attribute), attribute.toString()));
            boxC.getTextRuns().add(TextRunData.LineBreak);
        }

        data.getTextBoxes().add(boxC);

        PDFGenerator.ApplyTo(doc,data);
        doc.save(GetOutputFile());
    }

}
