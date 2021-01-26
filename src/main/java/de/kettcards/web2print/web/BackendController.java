package de.kettcards.web2print.web;

import de.kettcards.web2print.service.ImportService;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * @version 1.0
 */
@Deprecated
// user content like picutres should be uploaded with ContentController, administrative importing over ImportController
@RestController
@RequestMapping("${web2print.links.api-path}/backend")
public class BackendController extends StorageContextAware {

    private final ImportService importService;

    public BackendController(ImportService importService) {
        this.importService = importService;
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

    @Override
    public String getNamespace() {
        return "backendResources";
    }
}
