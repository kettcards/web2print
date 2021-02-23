package de.kettcards.web2print.web;

import de.kettcards.web2print.exceptions.content.ContentException;
import de.kettcards.web2print.service.ImportService;
import de.kettcards.web2print.service.MotiveImportService;
import de.kettcards.web2print.service.TextureImportService;
import de.kettcards.web2print.service.XlsxImportService;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.contraint.MediaTypeFileExtension;
import de.kettcards.web2print.storage.contraint.MediaTypeFileExtensionFilter;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;

import java.io.IOException;

/**
 * @version 1.0
 */
@Deprecated
// user content like picutres should be uploaded with ContentController, administrative importing over ImportController
@RestController
@RequestMapping("${web2print.links.api-path}/backend")
public final class BackendController extends StorageContextAware {

    private final ImportService importService;
    private final MotiveImportService motiveImportService;
    private final TextureImportService textureImportService;
    private final XlsxImportService xlsxImportService;

    public BackendController(ImportService importService, MotiveImportService motiveImportService, TextureImportService textureImportService, XlsxImportService xlsxImportService) {
        this.importService = importService;
        this.motiveImportService = motiveImportService;
        this.textureImportService = textureImportService;
        this.xlsxImportService = xlsxImportService;
    }

    /**
     * @param file file to upload
     * @return if resource upload was successful a unique resource id will be returned
     */
    @PostMapping("/resource")
    public String saveResource(@RequestParam("file") MultipartFile file) throws IOException {
        //TODO this is a temporally solution (again), importing should be relocated to their own endpoints
        Content content = Content.from(file);
        String ret = importService.importContent(content); //see ImportController
        if (ret.equals("200"))
            return ret;
        else //regular content,
            return save(content);
    }

    @GetMapping("/resource/{id}")
    public ResponseEntity<Resource> loadResource(@PathVariable String id) throws IOException {
        Content content = load(id);
        if (content == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(content.getContentMediaType()).body(content);
    }

    /**
     * @param file file to upload
     * @return status code or description of error
     */
    @PostMapping("/motive")
    public void saveMotive(@RequestParam("file") MultipartFile file) throws IOException {
        Content content = Content.from(file);
        content.assertContentExtension(MediaTypeFileExtensionFilter.MOTIVE);
        motiveImportService.importMotive(content);
    }

    /**
     * @param file file to upload
     * @return status code or description of error
     */
    @PostMapping("/defaultmotive")
    public void saveDefaultMotive(@RequestParam("file") MultipartFile file) throws IOException {
        Content content = Content.from(file);
        content.assertContentExtension(MediaTypeFileExtensionFilter.MOTIVE);
        motiveImportService.importDefaultMotive(content);
    }

    /**
     * @param file file to upload
     * @return status code or description of error
     */
    @PostMapping("/texture")
    public void saveTexture(@RequestParam("file") MultipartFile file) throws IOException {
        Content content = Content.from(file);
        content.assertContentExtension(MediaTypeFileExtensionFilter.BITMAP);
        textureImportService.importTexture(content);
    }

    /**
     * @param file file to upload
     * @return status code or description of error
     */
    @PostMapping("/xlsx")
    public void saveXlsxFile(@RequestParam("file") MultipartFile file) throws IOException {
        Content content = Content.from(file);
        content.assertContentExtension(MediaTypeFileExtensionFilter.EXCEL);
        xlsxImportService.importCards(content.getInputStream());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    public ModelAndView handleException(Exception exception) {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.addObject(exception);
        return modelAndView;
    }

    @Override
    public String getNamespace() {
        return "backendResources";
    }
}
