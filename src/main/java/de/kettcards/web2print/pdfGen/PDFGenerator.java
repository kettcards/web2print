package de.kettcards.web2print.pdfGen;

import lombok.Value;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;

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
        private final float X, Y, W, H;
        private final char  Alignment;
        private final List<ITextRun> TextRuns;

        public TextBox(float x, float y, float w, float h, char alignment) {
            X = x;
            Y = y;
            W = w;
            H = h;
            Alignment = alignment;
            TextRuns  = new ArrayList<>();
        }

        public void ApplyTo(PDPageContentStream content) throws IOException {
            content.newLineAtOffset(mm2pt(X), mm2pt(Y));
            // (lucas) do something with box related attributes here (alignment etc)

        }
    }
    @Value
    public static class TextRun implements ITextRun {
        private final Font      Font;
        private final float     FontSize;
        private final EnumSet<FontStyle> Attributes;
        private final String    Text;

        public TextRun(Font font, float fontSize, EnumSet<FontStyle> attributes, String text) {
            Font       = font;
            FontSize   = fontSize;
            Attributes = attributes;
            Text       = text;
        }

        public void ApplyTo(PDPageContentStream content) throws IOException {
            content.setFont(Font.Resolve(Attributes), FontSize);
            content.setLeading(FontSize);
            content.showText(Text);
            // (lucas) todo: draw a line for underlined text
        }
    }
    @Value
    public static class Font {
        private final PDFont Default;
        private final PDFont Bold;
        private final PDFont Italic;
        private final PDFont Bold_Italic;

        public Font(PDFont _default, PDFont bold, PDFont italic, PDFont bold_italic) {
            Default     = _default;
            Bold        = bold;
            Italic      = italic;
            Bold_Italic = bold_italic;
        }

        public PDFont Resolve(EnumSet<FontStyle> style) {
          if(style.contains(FontStyle.BOLD)){
            if(style.contains(FontStyle.ITALIC)){
              return Bold_Italic;
            } else {
              return Bold;
            }
          } else if(style.contains(FontStyle.ITALIC)) {
            return Italic;
          } else {
            return Default;
          }
        }
    }

    public static final ITextRun LineBreak = PDPageContentStream::newLine;

    public interface ITextRun {
        void ApplyTo(PDPageContentStream content) throws IOException;
    }


    public static PDDocument Generate(CardData data) throws IOException {
        var doc = new PDDocument();

        var page = new PDPage(data.getPageBounds());
        doc.addPage(page);

        var content = new PDPageContentStream(doc, page);
        content.beginText();
        for(var box : data.textBoxes) {
            box.ApplyTo(content);
            for(var run : box.TextRuns) {
                run.ApplyTo(content);
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