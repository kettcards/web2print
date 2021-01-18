package de.kettcards.web2print.pdfGen.cardData;

import lombok.Value;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static de.kettcards.web2print.pdfGen.PDFGenerator.mm2pt;

@Value
public class CardData {
    public static final Version CURRENT_VERSION = new Version(0, 2);

    Version version;
    float pageWidth, pageHeight;
    List<TextBoxData> innerElements;
    List<TextBoxData> outerElements;

    public CardData(String versionString, float pageWidth, float pageHeight) throws ParseException {
        this(versionString, pageWidth, pageHeight, new ArrayList<>(), new ArrayList<>());
    }
    public CardData(String versionString, float pageWidth, float pageHeight, List<TextBoxData> innerElements, List<TextBoxData> outerElements) throws ParseException {
        this(new Version(versionString), pageWidth, pageHeight, innerElements, outerElements);
    }
    public CardData(Version version, float pageWidth, float pageHeight, List<TextBoxData> innerElements, List<TextBoxData> outerElements) {
        if (!version.leq(CURRENT_VERSION))
            throw new IllegalArgumentException("version must be "+CURRENT_VERSION+" but is "+version);
        this.version       = version;
        this.pageWidth     = pageWidth;
        this.pageHeight    = pageHeight;
        this.innerElements = innerElements;
        this.outerElements = outerElements;
    }

    public PDRectangle getPageBounds() {
        return new PDRectangle(mm2pt(pageWidth), mm2pt(pageHeight));
    }

    @Value
    public static class Version {
        int minor;
        int major;

        public Version(String versionString) throws ParseException {
            var splitIndex = versionString.indexOf('.');
            this.major = Integer.parseInt(versionString, 0, splitIndex, 10);
            if(splitIndex >= 0) {
                if(splitIndex > versionString.length() - 2)
                    throw new ParseException("don in version string cant be the last character", splitIndex);
                this.minor = Integer.parseInt(versionString, splitIndex + 1, versionString.length(), 10);
            }
            else
                this.minor = 0;
        }
        public Version(int major, int minor) {
            this.major = major;
            this.minor = minor;
        }

        @Override
        public String toString() {
            return major+"."+minor;
        }

        public boolean leq(Version other) {
            return this.major <= other.major && this.minor <= other.minor;
        }
    }
}

