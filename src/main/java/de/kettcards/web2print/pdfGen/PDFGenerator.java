package de.kettcards.web2print.pdfGen;

import lombok.Value;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

public class PDFGenerator {
    // (lucas) not complete/final
    @Value
    public static class CardData {
        private final int version;

        private final float pageWidth;
        private final float pageHeight;

        private final List<TextBox> textBoxes;

        public CardData(int version, float pageWidth, float pageHeight){
            if(version != 0)
                throw new IllegalArgumentException("version must be 0 but is "+version);
            this.version = version;
            this.pageWidth = pageWidth;
            this.pageHeight = pageHeight;
            textBoxes = new ArrayList<>();
        }

        public PDRectangle getPageBounds() {
            return new PDRectangle(mm2pt(pageWidth), mm2pt(pageHeight));
        }
    }
    // (lucas) not complete/final
    @Value
    public static class TextBox {
        private final float x, y, w, h;
        private final char alignment;
        private final List<ITextRun> textRuns;

        public TextBox(float x, float y, float w, float h, char alignment) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.alignment = alignment;
            textRuns = new ArrayList<>();
        }

        public void applyTo(PDPageContentStream content) throws IOException {
            content.newLineAtOffset(mm2pt(x), mm2pt(y));
            // (lucas) do something with box related attributes here (alignment etc)

        }
    }
    @Value
    public static class TextRun implements ITextRun {
        private final Font font;
        private final float fontSize;
        private final EnumSet<FontStyle> attributes;
        private final String text;

        public TextRun(Font font, float fontSize, EnumSet<FontStyle> attributes, String text) {
            this.font = font;
            this.fontSize = fontSize;
            this.attributes = attributes;
            this.text = text;
        }

        public void applyTo(PDPageContentStream content) throws IOException {
            content.setFont(font.Resolve(attributes), fontSize);
            content.setLeading(fontSize);
            content.showText(text);
            // (lucas) todo: draw a line for underlined text

        }
    }
    @Value
    public static class Font {
        private final PDFont _default;
        private final PDFont bold;
        private final PDFont italic;
        private final PDFont bold_Italic;

        public Font(PDFont _default, PDFont bold, PDFont italic, PDFont bold_italic) {
            this._default = _default;
            this.bold = bold;
            this.italic = italic;
            bold_Italic = bold_italic;
        }

        public PDFont Resolve(EnumSet<FontStyle> style) {
          if(style.contains(FontStyle.BOLD)){
            if(style.contains(FontStyle.ITALIC)){
              return bold_Italic;
            } else {
              return bold;
            }
          } else if(style.contains(FontStyle.ITALIC)) {
            return italic;
          } else {
            return _default;
          }
        }
    }

    @Value
    public static class customFont {
        private PDFont custom;
        private PDFont custom_bold;
        private PDFont custom_italic;
        private PDFont custom_bold_Italic;

        public customFont(File custom, File bold, File italic, File bold_italic){

        }

        public PDFont Resolve(EnumSet<FontStyle> style) {
            if(style.contains(FontStyle.BOLD)){
                if(style.contains(FontStyle.ITALIC)){
                    return custom_bold_Italic;
                } else {
                    return custom_bold;
                }
            } else if(style.contains(FontStyle.ITALIC)) {
                return custom_italic;
            } else {
                return custom;
            }
        }
    }

    public static final ITextRun lineBreak = PDPageContentStream::newLine;

    public interface ITextRun {
        void applyTo(PDPageContentStream content) throws IOException;
    }

    private static PDDocument doc = null;

    public static PDDocument Generate(CardData data) throws IOException {
        doc = new PDDocument();

        var page = new PDPage(data.getPageBounds());
        doc.addPage(page);

        var content = new PDPageContentStream(doc, page);
        content.beginText();
        for(var box : data.textBoxes) {
            box.applyTo(content);
            for(var run : box.textRuns) {
                run.applyTo(content);
            }
        }
        content.endText();
        content.close();

        return doc;
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