package de.kettcards.web2print;

import de.kettcards.web2print.pdfGen.FontStyle;
import de.kettcards.web2print.pdfGen.PDFGenerator;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.EnumSet;

class PdfGenTests {
  static final int CURRENT_FORMAT_VERSION = 0;

  @BeforeAll
  static void Init() throws IOException {
    var path = Path.of("./test_output");
    if(!Files.exists(path))
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

  @Test
  //US015 - "PDF Generator - Seitenformat"
  void freePageDims() throws IOException {
    var data = new PDFGenerator.CardData(CURRENT_FORMAT_VERSION, 400, 300);
    var doc  = PDFGenerator.Generate(data);
    doc.save(GetOutputFile());
  }

  static PDFGenerator.TextRun makeDefaultTextRun(String text){
    return makeDefaultTextRun(EnumSet.of(FontStyle.NONE), text);
  }
  static PDFGenerator.TextRun makeDefaultTextRun(EnumSet<FontStyle> attributes, String text){
    var font = new PDFGenerator.Font(PDType1Font.HELVETICA, PDType1Font.HELVETICA_BOLD, PDType1Font.HELVETICA_OBLIQUE, PDType1Font.HELVETICA_BOLD_OBLIQUE);
    return new PDFGenerator.TextRun(font, 12, attributes, text);
  }
  static PDFGenerator.TextRun makeCustomTextRun(File[] fonts, EnumSet<FontStyle> attributes, String text){
    var font = new PDFGenerator.CustomFont(fonts[0],fonts[1],fonts[2],fonts[3]);
    return new PDFGenerator.CustomTextRun(font,12, attributes,text);
  }


  @Test
  //US016 - "PDF Generator - Text, Positionierung"
  void freeTextPositioning() throws IOException {
    var data = new PDFGenerator.CardData(CURRENT_FORMAT_VERSION, 150, 200);
    var box  = new PDFGenerator.TextBox(20, data.getPageWidth() - 100, -1, -1, 'l');
    box.getTextRuns().add(makeDefaultTextRun("Diese Zeile ist auf X: " + box.getX() + ";Y: " + box.getY()));
    box.getTextRuns().add(PDFGenerator.lineBreak);
    box.getTextRuns().add(makeDefaultTextRun("Zeile 2"));
    data.getTextBoxes().add(box);

    var doc  = PDFGenerator.Generate(data);
    doc.save(GetOutputFile());
  }

  @Test
  //US019 - "PDF Generator - Text, Schriftart"
  void customTextFont() throws IOException {
    var data = new PDFGenerator.CardData(CURRENT_FORMAT_VERSION, 200, 200);
    var box  = new PDFGenerator.TextBox(10, data.getPageWidth() - 20, -1, -1, 'l');
    for(var attribute : FontStyle.values()){
      box.getTextRuns().add(makeDefaultTextRun(EnumSet.of(attribute), attribute.toString()));
      box.getTextRuns().add(makeDefaultTextRun(" "));
    }
    box.getTextRuns().add(PDFGenerator.lineBreak);

    box.getTextRuns().add(makeDefaultTextRun(EnumSet.of(FontStyle.BOLD, FontStyle.ITALIC), "BOLD_ITALIC"));
    box.getTextRuns().add(makeDefaultTextRun(" "));
    box.getTextRuns().add(makeDefaultTextRun(EnumSet.of(FontStyle.BOLD, FontStyle.UNDERLINE), "BOLD_UNDERLINE"));
    box.getTextRuns().add(PDFGenerator.lineBreak);

    box.getTextRuns().add(makeDefaultTextRun(EnumSet.of(FontStyle.BOLD, FontStyle.ITALIC, FontStyle.UNDERLINE), "BOLD_ITALIC_UNDERLINE"));

    File[] customFont = {new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf"),new File("src/test/java/de/kettcards/web2print/customFontTest/HanaleiFill-Regular.ttf")};
    for(var attribute : FontStyle.values()){
      box.getTextRuns().add(makeCustomTextRun(customFont,EnumSet.of(attribute), attribute.toString()));
      box.getTextRuns().add(makeDefaultTextRun(" "));
    }

    data.getTextBoxes().add(box);

    var doc  = PDFGenerator.Generate(data);
    doc.save(GetOutputFile());
  }
}
