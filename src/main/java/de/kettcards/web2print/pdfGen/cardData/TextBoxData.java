package de.kettcards.web2print.pdfGen.cardData;

import de.kettcards.web2print.pdfGen.PDFGenerator;
import lombok.Getter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static de.kettcards.web2print.pdfGen.PDFGenerator.mm2pt;


public class TextBoxData extends BoxData{
    @Getter
    private final char alignment;
    @Getter
    private final List<TextRunData> textRuns;

    public TextBoxData(float x, float y, float w, float h, char alignment) {
        this(x, y, w, h, alignment, new ArrayList<>());
    }

    /**
     * x and y are top left coords from text box starting from origin which is at bottm left
     * @param x - where Textbox is on x Axis in mm
     * @param y - where Textbox is on Y Axis in mm
     * @param w - width of Textbox in mm
     * @param h - height of Textbox in mm
     * @param alignment - alignment of Text
     * @param textRuns - textRuns.
     */
    public TextBoxData(float x, float y, float w, float h, char alignment, List<TextRunData> textRuns) {
        super(x,y,w,h);
        this.alignment = alignment;
        this.textRuns = textRuns;
    }

    @Override
    public void applyTo(PDDocument doc, PDPageContentStream content) throws IOException {
        content.beginText();
        var box = this;
        float largestFontSize = PDFGenerator.getLargestFontSize(box.getTextRuns().listIterator());
        switch (box.getAlignment()) {
            //since TextBoxData stores everything in mm, the conversion to pt must be handeled here
            case 'c':
                content.newLineAtOffset((box.getXInPt() / 2f), box.getYInPt() + mm2pt(box.getHInMM()) - largestFontSize);
                //content.newLineAtOffset(mm2pt(box.getWInMM() / 2), box.getYInPt() + mm2pt(box.getHInMM()) - largestFontSize);
                break;
            //TODO: justify case
            case 'l':
            case 'j': //corresponding to the alignment the newLineAtOffset will be set
            case 'r':
            default:
                content.newLineAtOffset(box.getXInPt(), box.getYInPt() + mm2pt(box.getHInMM()) - largestFontSize);
                break;
        }
        var runsIter = box.getTextRuns().listIterator();
        while (runsIter.hasNext()) {
            TextRunData run = runsIter.next();
            if (run == TextRunData.LineBreak) { //when new line it has to check the largest font size in that line to adjust the leading
                var lineIter = box.getTextRuns().listIterator(runsIter.nextIndex());
                largestFontSize = PDFGenerator.getLargestFontSize(lineIter);
                if (largestFontSize > 0) {
                    content.setLeading(largestFontSize);
                    content.newLine();
                    //dont need to set the font back, itll get set back with the next run
                }
            } else {
                var font = run.getFont().resolve(run.getAttributes());
                var runWidth = run.getFontSize() * font.getStringWidth(run.getText()) / 1000;
                content.setFont(font, run.getFontSize());
                switch (box.getAlignment()) { //corresponding to the alignment the cursor gets shiftet
                    case 'r':
                        content.newLineAtOffset(-runWidth, 0);
                        content.showText(run.getText());
                        content.newLineAtOffset(runWidth, 0);
                        break;
                    case 'c':
                        content.newLineAtOffset(-(runWidth / 2), 0);
                        content.showText(run.getText());
                        content.newLineAtOffset((runWidth / 2), 0);
                        break;
                    //TODO: justify case
                    default:
                        content.showText(run.getText());
                        break;
                }
                    /*
                    if (run.getAttributes().contains(FontStyle.UNDERLINE)) {
                        lineList.add(new LineData(cursorX, cursorY - 1.75f, runWidth));
                    }
                    */
            }
        }
        content.endText();
    }
}
