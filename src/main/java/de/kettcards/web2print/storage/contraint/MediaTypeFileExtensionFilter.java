package de.kettcards.web2print.storage.contraint;

import de.kettcards.web2print.exceptions.content.ContentException;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageConstraint;
import de.kettcards.web2print.storage.StorageContext;
import lombok.NonNull;
import lombok.Value;

import static de.kettcards.web2print.storage.contraint.MediaTypeFileExtension.*;

@Value
public class MediaTypeFileExtensionFilter implements StorageConstraint {

    public static final MediaTypeFileExtensionFilter IMAGE = new MediaTypeFileExtensionFilter(PNG, JPG, SVG, EPS);

    MediaTypeFileExtension[] contentExtensions;

    public MediaTypeFileExtensionFilter(@NonNull MediaTypeFileExtension... contentExtensions) {
        this.contentExtensions = contentExtensions;
    }

    @Override
    public void validate(StorageContext context, Content content) throws ContentException {
        content.assertContentExtension(contentExtensions);
    }

}
