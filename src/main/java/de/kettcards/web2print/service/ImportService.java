package de.kettcards.web2print.service;

import de.kettcards.web2print.storage.Content;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@Deprecated
public final class ImportService {

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
        String response = "200"; //TODO response code should be int
        String originalName = content.getOriginalFilename();

        if (originalName == null) {
            log.warn("file isn't defined or unavailable");
            return "500";
        }

        if (content.getContentType() == null) {
            log.warn("file doesn't have a content type");
            return "500";
        }

        switch (content.getContentType()) {
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                xlsxImportService.importCards(content.getInputStream());
                break;
            case "image/jpeg":
            case "image/png":
                response = textureImportService.importTexture(content);
                break;
            case "application/pdf":
                response = motiveImportService.importMotive(content);
                break;
            default:
                response = "415";
                log.warn(content.getContentType() + " is not a valid content type");
                break;
        }
        return response;
    }


}
