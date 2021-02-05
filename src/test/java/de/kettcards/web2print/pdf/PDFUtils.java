package de.kettcards.web2print.pdf;

import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import java.awt.*;
import java.io.IOException;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.spy;

public class PDFUtils {

    static CardData emptyCardData = new CardData(0, 0, Collections.emptyList(), Collections.emptyList());

    /**
     * shows 1 pt box outline for given box
     *
     * @param doc document
     * @param box box
     * @throws IOException if drawing is not possible
     */
    private static void drawOutline(Document doc, BoxData box) throws IOException {
        var content = doc.stream();
        content.setLineWidth(1);
        content.moveTo(box.getX() + doc.getXOffset(), box.getY() + doc.getYOffset());
        content.lineTo(box.width + box.getX() + doc.getXOffset(), box.getY() + doc.getYOffset());
        content.lineTo(box.width + box.getX() + doc.getXOffset(), box.getY() + doc.getYOffset() + box.getHeight());
        content.lineTo(box.getX() + doc.getXOffset(), box.getY() + doc.getYOffset() + box.getHeight());
        content.lineTo(box.getX() + doc.getXOffset(), box.getY() + doc.getYOffset());
        content.stroke();
    }

    static void drawGrid(Document doc) throws Throwable {
        for (int i = 0; i < doc.getNumberOfPages(); i++) {
            PDPage page = doc.getPage(i);
            float width = page.getMediaBox().getWidth();
            float height = page.getMediaBox().getHeight();
            try {
                var stream = new PDPageContentStream(doc, page, PDPageContentStream.AppendMode.APPEND, true);
                stream.moveTo(0, 0);
                for (int w = 0; w < width; w += 10) {
                    if (w % 100 == 0)
                        stream.setStrokingColor(Color.RED);
                    else
                        stream.setStrokingColor(Color.LIGHT_GRAY);
                    stream.moveTo(w, 0);
                    stream.lineTo(w, height);
                    stream.stroke();
                }
                stream.moveTo(0, 0);
                for (int h = 0; h < height; h += 10) {
                    if (h % 100 == 0)
                        stream.setStrokingColor(Color.RED);
                    else
                        stream.setStrokingColor(Color.LIGHT_GRAY);
                    stream.moveTo(0, h);
                    stream.lineTo(width, h);
                    stream.stroke();
                }

                stream.stroke();
                stream.close();
            } catch (Exception ex) {
                fail(ex);
            }
        }
    }

    static List<BoxData> applyBoxOutline(Document doc, List<BoxData> boxes) throws IOException {
        var ret = new LinkedList<BoxData>();
        for (var box : boxes) {
            BoxData spiedBox = spy(box);
            doAnswer(e -> {
                drawOutline(doc, box);
                e.callRealMethod();
                return null;
            }).when(spiedBox).apply(doc);
            ret.add(spiedBox);
        }
        return ret;
    }

    static CardData enableBoxOutline(Document doc, CardData cardData) throws IOException {
        return new CardData(
                cardData.getPageWidth(),
                cardData.getPageHeight(),
                applyBoxOutline(doc, cardData.getInnerElements()),
                applyBoxOutline(doc, cardData.getOuterElements())
        );
    }

}
