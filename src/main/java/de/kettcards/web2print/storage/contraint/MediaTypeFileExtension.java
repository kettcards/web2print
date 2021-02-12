package de.kettcards.web2print.storage.contraint;

import lombok.Value;

/**
 * associates media type (Content-Type attribute) with the necessary file extension
 * https://wiki.selfhtml.org/wiki/MIME-Type/%C3%9Cbersicht
 */
@Value
public class MediaTypeFileExtension {

    public static final MediaTypeFileExtension JPG = new MediaTypeFileExtension(
            new String[]{"image/jpeg"},
            new String[]{".jpeg", ".jpg", ".jpe"});

    public static final MediaTypeFileExtension PNG = new MediaTypeFileExtension(
            new String[]{"image/png"},
            new String[]{".png"});

    public static final MediaTypeFileExtension SVG = new MediaTypeFileExtension(
            new String[]{"image/svg+xml"},
            new String[]{".svg"});

    public static final MediaTypeFileExtension EPS = new MediaTypeFileExtension(
            new String[]{"application/postscript", "application/eps", "application/x-eps", "image/eps", "image/x-eps"},
            new String[]{".eps", ".epsf", ".epsi"});

    public static final MediaTypeFileExtension PDF = new MediaTypeFileExtension(
            new String[]{"application/pdf"},
            new String[]{".pdf"});

    public static final MediaTypeFileExtension XLSX = new MediaTypeFileExtension(
            new String[]{"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
            new String[]{".xlsx"});

    String[] contentTypes, fileExtensions;

    public boolean isValidFileExtension(String extension) {
        for (String fileExtension : fileExtensions) {
            if (fileExtension.equals(extension)) return true;
        }
        return false;
    }

}
