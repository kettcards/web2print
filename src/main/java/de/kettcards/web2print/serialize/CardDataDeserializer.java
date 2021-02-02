package de.kettcards.web2print.serialize;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.model.fonts.FontStyle;
import de.kettcards.web2print.pdf.BoxData;
import de.kettcards.web2print.pdf.CardData;
import de.kettcards.web2print.pdf.ImageBoxData;
import de.kettcards.web2print.pdf.textBox.*;
import de.kettcards.web2print.service.CardService;
import org.springframework.boot.jackson.JsonComponent;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import static de.kettcards.web2print.pdf.PDFGenerator.mm2pt;

//TODO null checking for nodes, in general : better exception handling
@JsonComponent
public class CardDataDeserializer extends JsonDeserializer<CardData> {

    private final CardService cardService;

    public CardDataDeserializer(CardService cardService) {
        this.cardService = cardService;
    }

    @Override
    public CardData deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode root = p.getCodec().readTree(p);

        var cardId = root.get("card").textValue();
        CardFormat cardFormat = cardService.findCardFormat(cardId);

        var innerNode = root.get("innerEls");
        List<BoxData> innerElse = parsePage(innerNode);
        var outerNode = root.get("outerEls");
        List<BoxData> outerElse = parsePage(outerNode);

        return new CardData(mm2pt(cardFormat.getWidth()), mm2pt(cardFormat.getHeight()), innerElse, outerElse);
    }

    private List<BoxData> parsePage(JsonNode textBoxArrayNode) throws IOException {
        List<BoxData> ret = new ArrayList<>();

        for (var textBoxNode : textBoxArrayNode) {
            //box positioning
            var x = mm2pt(textBoxNode.get("x").floatValue());
            var y = mm2pt(textBoxNode.get("y").intValue());
            var width = mm2pt(textBoxNode.get("w").intValue());
            var height = mm2pt(textBoxNode.get("h").intValue());


            //type
            var textTypeNode = textBoxNode.get("t");
            switch (textTypeNode.textValue()) {
                case "t": //text
                    var paragraphs = new LinkedList<TextParagraph>();

                    var runNode = textBoxNode.get("r");
                    if (runNode == null)
                        continue;
                    Iterator<JsonNode> runs = runNode.iterator();
                    if (!runs.hasNext()) { //no runs present
                        continue;
                    }
                    //at least one run present
                    List<TextSpan> spans = new LinkedList<>();
                    for (JsonNode current; runs.hasNext(); ) {
                        current = runs.next();
                        if (current.isTextual()) {
                            if (current.textValue().equals("br")) { //linebreak
                                paragraphs.add(new TextParagraph(spans));
                                spans = new LinkedList<>();
                            } else {
                                throw new IOException();
                            }
                        } else { //expect span
                            spans.add(parseTextSpan(current));
                        }
                    }
                    //put last spans even if no br is left
                    if (!spans.isEmpty())
                        paragraphs.add(new TextParagraph(spans));

                    //box alignment
                    var alignment = textBoxNode.get("a").textValue().charAt(0);
                    switch (alignment) {
                        case 'l':
                            ret.add(new LeftAlignedTextBoxData(x, y, width, height, paragraphs));
                            break;
                        case 'c':
                            ret.add(new CenterAlignedTextBoxData(x, y, width, height, paragraphs));
                            break;
                        case 'r':
                            ret.add(new RightAlignedTextBoxData(x, y, width, height, paragraphs));
                            break;
                        default:
                            throw new IOException();
                    }

                    break;
                case "i": //image
                    var content = textBoxNode.get("s").textValue();
                    ret.add(new ImageBoxData(x, y, width, height, content));
                    break;
                default:
                    throw new IOException();
            }
        }
        return ret;
    }

    public TextSpan parseTextSpan(JsonNode textSpanNode) throws IOException {
        var fontNode = textSpanNode.get("f");
        var fontSizeNode = textSpanNode.get("s");
        var fontStyleNode = textSpanNode.get("a");
        var textNode = textSpanNode.get("t");

        var font = fontNode.textValue();
        var fontSize = fontSizeNode.floatValue();
        var fontStyle = FontStyle.getFontStyle(fontStyleNode.intValue());
        var text = textNode.textValue();

        return new TextSpan(font, fontSize, fontStyle, text);
    }


}
