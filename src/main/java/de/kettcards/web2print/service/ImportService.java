package de.kettcards.web2print.service;

import de.kettcards.web2print.storage.Content;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@Deprecated
public class ImportService {

    private final XlsxImportService xlsxImportService;

    private final TextureImportService textureImportService;

    private final MotiveImportService motiveImportService;

    public ImportService(XlsxImportService xlsxImportService,
                         TextureImportService textureImportService,
                         MotiveImportService motiveImportService) {
        this.xlsxImportService = xlsxImportService;
        this.textureImportService = textureImportService;
        this.motiveImportService = motiveImportService;
    }


    /**
     * determines the import service for given content
     *
     * @return resource name
     * @throws IOException if import was unsuccessful
     */
    public String importContent(Content content) throws IOException {
        String originalName = content.getOriginalFilename();

        if (originalName == null) {
            throw new IOException("file isn't defined or unavailable");
        }

        if (content.getContentType() == null) {
            throw new IOException("file doesn't have a content type");
        }

        switch (content.getContentType()) {
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                xlsxImportService.importCards(content.getInputStream());
                break;
            case "image/jpeg":
            case "image/png":
                textureImportService.importTexture(content);
                break;
            case "application/pdf":
                motiveImportService.importMotive(content);
                break;
            default:
                throw new IOException(content.getContentType() + " is not a valid content type");
        }
        return originalName;
    }


}
