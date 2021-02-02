package de.kettcards.web2print.pdf;

import de.kettcards.web2print.storage.Content;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.util.Matrix;

import javax.imageio.ImageIO;
import java.io.IOException;

/**
 * image node representation
 */
public class ImageBoxData extends BoxData {

    private final String contentId;

    public ImageBoxData(float x, float y, float width, float height, String contentId) {
        super(x, y, width, height);
        this.contentId = contentId;
    }

    @Override
    public void apply(Document doc) throws IOException {
        final Content content = doc.resolveContent(contentId);
        if (content == null)
            throw new IOException("unable to resolve referenced content:" + contentId);
        PDImageXObject img = embedImage(doc, content);
        Matrix m = new Matrix(this.width,0,0,this.height,doc.getXOffset()+this.x,doc.getYOffset()+this.y);
        doc.stream().drawImage(img,m);
        //int[] scaledDim = getScaledDimension(img.getWidth(), img.getHeight(), (int) width, (int) height);
        //doc.stream().drawImage(img, x + doc.getXOffset(), y + doc.getYOffset(), scaledDim[0], scaledDim[1]);

    }

    /**
     *
     * @param document doc
     * @param content content to embed
     * @return the embedded image object bound to the given doc
     * @throws IOException
     */
    private PDImageXObject embedImage(Document document, Content content) throws IOException {
        var type = content.getContentType();
        switch (type) {
            case "image/jpg":
            case "image/jpeg":
                return JPEGFactory.createFromStream(document, content.getInputStream());
            case "image/gif":
            case "image/bmp":
            case "image/png":
                return LosslessFactory.createFromImage(document, ImageIO.read(content.getInputStream()));
            default:
                throw new IOException("unsupported image type: " + type);
        }
    }

    /**
     *
     * @param originalWidth image width
     * @param originalHeight image height
     * @param boundWidth bound width
     * @param boundHeight bound height
     * @return x, y coords for scaled image
     */
    private static int[] getScaledDimension(int originalWidth, int originalHeight, int boundWidth, int boundHeight) {
        int newWidth = originalWidth;
        int newHeight = originalHeight;

        // first check if we need to scale width
        if (originalWidth > boundWidth) {
            //scale width to fit
            newWidth = boundWidth;
            //scale height to maintain aspect ratio
            newHeight = (newWidth * originalHeight) / originalWidth;
        }

        // then check if we need to scale even with the new height
        if (newHeight > boundHeight) {
            //scale height to fit instead
            newHeight = boundHeight;
            //scale width to maintain aspect ratio
            newWidth = (newHeight * originalWidth) / originalHeight;
        }
        return new int[]{newWidth, newHeight};
    }

}
