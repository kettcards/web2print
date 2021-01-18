package de.kettcards.web2print.pdfGen;

import com.fasterxml.jackson.databind.JsonNode;
import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.model.fonts.Font;
import de.kettcards.web2print.model.fonts.FontStyle;
import de.kettcards.web2print.pdfGen.cardData.*;
import de.kettcards.web2print.service.FontService;
import lombok.Value;
import org.apache.pdfbox.pdmodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.text.ParseException;
import java.util.*;
import java.util.function.Function;

@Component
public class PDFGenerator {
    @Autowired
    private FontService fontService;

    /**
     * @param dimensionProvider a provider that can obtain the dimensions of a card by their id
     */
    public PDDocument generateFromJSON(JsonNode jRoot, Function<String, CardFormat> dimensionProvider) throws IOException, ParseException {
        var doc = new Document();

        var format = dimensionProvider.apply(jRoot.get("card").textValue());
        var cardData = new CardData(jRoot.get("v").textValue(), format.getWidth(), format.getHeight());

        parseElements(jRoot.get("innerEls"), cardData.getInnerElements(), doc);
        parseElements(jRoot.get("outerEls"), cardData.getOuterElements(), doc);

        applyTo(doc.getDocument(), cardData);

        return doc.getDocument();
    }
    private void parseElements(JsonNode source, List<TextBoxData> target, Document doc) throws ParseException, IOException {
        for (var jBox : source) {
            var box = new TextBoxData(
                jBox.get("x").floatValue(), jBox.get("y").floatValue(),
                jBox.get("w").floatValue(), jBox.get("h").floatValue(),
                jBox.get("a").textValue().charAt(0)
            );

            for (var jRun : jBox.get("r")) {
                TextRunData run;
                if (jRun.isTextual()) {
                    if (!jRun.textValue().equals("br"))
                        throw new ParseException("if a text run array contains a raw string it must be 'br' but it was '"+jRun.textValue()+"'", -1);
                    else
                        run = TextRunData.LineBreak;
                } else {
                    var fontName = jRun.get("f").textValue();
                    if (!fontService.has(fontName))
                        throw new RuntimeException("the font '"+fontName+"' was not added to the FontStore before using it in Generate");
                    var docFonts = doc.getLoadedFonts();
                    if (!docFonts.containsKey(fontName))
                        doc.addFont(fontService.getProvider(fontName));
                    run = new TextRunData(
                        docFonts.get(fontName),
                        jRun.get("s").floatValue(),
                        FontStyle.getSet(jRun.get("a").intValue()),
                        jRun.get("t").textValue()
                    );
                }

                box.getTextRuns().add(run);
            }

            target.add(box);
        }
    }

    public void applyTo(PDDocument doc, CardData data) throws IOException {

        var lineList = new ArrayList<LineData>();

        var page = new PDPage(data.getPageBounds());
        doc.addPage(page);

        var content = new PDPageContentStream(doc, page);

        for (var box : data.getInnerElements()) {
            switch (box.getAlignment()) {
                case 'l':
                    textBoxLeft(content, box, lineList);
                    break;
                case 'r':
                    textBoxRight(content, box, lineList);
                    break;
                case 'c':
                    textBoxCenter(content, box, lineList);
                    break;
                case 'j':
                    textBoxJustify(content, box, lineList);
                    break;
                default:
                    continue;
            }
        }
        content.close();
    }

    private static void textBoxLeft(PDPageContentStream content, TextBoxData box, ArrayList<LineData> lineList) throws IOException {
        float cursorX, cursorY;
        content.beginText();
        cursorX = box.getOffX();
        cursorY = box.getOffY();
        box.applyTo(content);
        var runsIter = box.getTextRuns().listIterator();
        while (runsIter.hasNext()) {
            TextRunData run = runsIter.next();
            if (run == TextRunData.LineBreak) {
                cursorX = box.getOffX();
                cursorY = getCursorY(content, box, cursorY, runsIter);
            } else {
                var font = run.getFont().resolve(run.getAttributes());
                content.setFont(font, run.getFontSize());
                content.showText(run.getText());

                var runWidth = run.getFontSize() * font.getStringWidth(run.getText()) / 1000;
                if (run.getAttributes().contains(FontStyle.UNDERLINE)) {
                    lineList.add(new LineData(cursorX, cursorY - 1.75f, runWidth));
                }
                cursorX += runWidth;
            }
        }
        line(content, lineList);
    }

    private static void textBoxRight(PDPageContentStream content, TextBoxData box, ArrayList<LineData> lineList) throws IOException {
        float cursorX, cursorY;
        content.beginText();
        cursorX = box.getW();
        cursorY = box.getOffY();
        box.applyTo(content);
        var runsIter = box.getTextRuns().listIterator();
        while (runsIter.hasNext()) {
            TextRunData run = runsIter.next();
            if (run == TextRunData.LineBreak) {
                cursorX = box.getW();
                cursorY = getCursorY(content, box, cursorY, runsIter);
            } else {
                var font = run.getFont().resolve(run.getAttributes());
                var runWidth = run.getFontSize() * font.getStringWidth(run.getText()) / 1000;
                content.setFont(font, run.getFontSize());
                content.newLineAtOffset(-runWidth, 0);
                content.showText(run.getText());
                content.newLineAtOffset(runWidth, 0);

                if (run.getAttributes().contains(FontStyle.UNDERLINE)) {
                    lineList.add(new LineData(cursorX - runWidth, cursorY - 1.75f, runWidth));
                }
                cursorX += runWidth;
            }
        }
        line(content, lineList);
    }

    private static void textBoxCenter(PDPageContentStream content, TextBoxData box, ArrayList<LineData> lineList) throws IOException {
        float cursorX, cursorY;
        content.beginText();
        cursorX = box.getW() / 2;
        cursorY = box.getOffY();
        box.applyTo(content);
        var runsIter = box.getTextRuns().listIterator();
        while (runsIter.hasNext()) {
            TextRunData run = runsIter.next();
            if (run == TextRunData.LineBreak) {
                cursorX = box.getW() / 2;
                cursorY = getCursorY(content, box, cursorY, runsIter);
            } else {
                var font = run.getFont().resolve(run.getAttributes());
                var runWidth = run.getFontSize() * font.getStringWidth(run.getText()) / 1000;
                content.setFont(font, run.getFontSize());
                content.newLineAtOffset(-(runWidth / 2), 0);
                content.showText(run.getText());
                content.newLineAtOffset((runWidth / 2), 0);

                if (run.getAttributes().contains(FontStyle.UNDERLINE)) {
                    lineList.add(new LineData(cursorX - (runWidth / 2), cursorY - 1.75f, runWidth));
                }
                cursorX += runWidth;
            }
        }
        line(content, lineList);
    }

    private static void textBoxJustify(PDPageContentStream content, TextBoxData box, ArrayList<LineData> lineList) throws IOException {
        float cursorX, cursorY, wordSpacing = 0, free = box.getW();
        long spaceCount = 0;
        String line = "";
        content.beginText();
        cursorX = box.getOffX();
        cursorY = box.getOffY();
        box.applyTo(content);
        var runsIter = box.getTextRuns().listIterator();
        TextRunData current = null, next = null;
        while (runsIter.hasNext()) {
            if(current == null){
                current = runsIter.next();
            }else{
                current = next;
            }
            if (current == TextRunData.LineBreak) {
                cursorX = box.getOffX();
                cursorY = getCursorY(content, box, cursorY, runsIter);
                free = box.getW();
                spaceCount = 0;
                next = runsIter.next();
            } else {
                var font = current.getFont().resolve(current.getAttributes());
                var runWidth = current.getFontSize() * font.getStringWidth(current.getText()) / 1000;
                free -= runWidth;
                spaceCount += current.getText().chars().filter(ch -> ch == ' ').count();
                line = line + current.getText();

                next = runsIter.next();

                if (!runsIter.hasNext() || next == TextRunData.LineBreak) {
                    if (free > 0) {
                        wordSpacing = free / spaceCount;
                    }
                    content.setFont(font, current.getFontSize());
                    System.out.println("länge"+ line.length());
                    if (line.length() >= 40) {
                        content.setWordSpacing(wordSpacing);
                    }
                    content.showText(line);

                    line = "";
                }

                if (current.getAttributes().contains(FontStyle.UNDERLINE)) {
                    lineList.add(new LineData(cursorX, cursorY - 1.75f, runWidth));
                }
                cursorX += runWidth;
            }
        }
        line(content, lineList);
    }

    private static void line(PDPageContentStream content, ArrayList<LineData> lineList) throws IOException {
        content.endText();

        if (lineList.size() > 0) {
            content.setLineWidth(1);
            for (var line : lineList) {
                content.moveTo(line.getX(), line.getY());
                content.lineTo(line.getX() + line.getW(), line.getY());
                content.stroke();
            }
            lineList.clear();
        }
    }

    private static float getCursorY(PDPageContentStream content, TextBoxData box, float cursorY, ListIterator<TextRunData> runsIter) throws IOException {
        float largestFontSize = 0;
        var lineIter = box.getTextRuns().listIterator(runsIter.nextIndex());
        TextRunData nxt;
        while (lineIter.hasNext() && (nxt = lineIter.next()) != TextRunData.LineBreak) {
            if (nxt.getFontSize() > largestFontSize) {
                largestFontSize = nxt.getFontSize();
            }
        }
        cursorY -= largestFontSize;

        if (largestFontSize > 0) {
            content.setLeading(largestFontSize);
            content.newLine();
            //dont need to set the font back, itll get set back with the next run
        }
        return cursorY;
    }


    @Value
    private static class LineData {
        float x;
        float y;
        float w;

        public LineData(float x, float y, float w) {
            this.x = x;
            this.y = y;
            this.w = w;
        }
    }

    @Value
    private static class Document {
        PDDocument document;
        HashMap<String, Font> loadedFonts;

        public Document() {
            document = new PDDocument();
            loadedFonts = new HashMap<>(5);
        }

        public void addFont(Font.Provider provider) throws IOException {
            getLoadedFonts().put(provider.getName(), provider.load(getDocument()));
        }
    }

    /**
     * converts mm to pt
     *
     * @param value in mm
     * @return value in pt
     */
    public static float mm2pt(float value) {
        return value / 25.4f * 72.0f;
    }

    /**
     * converts pt to mm
     *
     * @param value in pt
     * @return value in mm
     */
    public static float pt2mm(float value) {
        return value * 25.4f / 72.0f;
    }
}