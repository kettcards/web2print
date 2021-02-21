package de.kettcards.web2print.pdf.textBox;

import de.kettcards.web2print.pdf.Document;

import java.io.IOException;
import java.util.List;

/**
 * applies left alignment for each paragraph
 */
public class LeftAlignedTextBoxData extends TextBoxData {

    public LeftAlignedTextBoxData(float x, float y, float width, float height, List<TextParagraph> textParagraphs, float lineHeight) {
        super(x, y, width, height, textParagraphs,lineHeight);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setInitialBoxPosition(Document doc, TextParagraph firstParagraph) throws IOException {
        doc.stream().newLineAtOffset(x, y + height);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setParagraphBeginPosition(Document doc, float paragraphWidth) {

    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setParagraphEndPosition(Document doc, float paragraphWidth) {

    }


}
