package de.kettcards.web2print.web;

import de.kettcards.web2print.service.LayoutStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import java.io.IOException;
import java.text.ParseException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("${web2print.links.api-path}")
public final class SaveController {

    @Autowired
    private LayoutStorageService storageService;

    @PostMapping(value = {"/save/", "/save/{storageId}"})
    public String save(
        @PathVariable(required = false) String storageId,
        @RequestParam                   String export,
        @RequestParam("data")           String cardData,
        @RequestParam(required = false) String form
    ) throws IOException, ParseException, MessagingException {
        storageId = storageService.storeCard(storageId, cardData);
        if (export.equals("true"))
            storageService.exportCard(cardData, form);
        return storageId;
    }

    @GetMapping(value = {"/load/{storageId}"}, produces = "application/octet-stream")
    public String load(@PathVariable String storageId) throws IOException {
        return storageService.loadCard(storageId);
    }

    @GetMapping(value = {"/pdfs"})
    public List<String> list() throws IOException, ParseException {
        return storageService.list();
    }

    @GetMapping(value = {"/pdfs/{storageId}"}, produces = "application/pdf")
    public Resource show(@PathVariable(required = false) String storageId) throws IOException {
        return storageService.load(storageId);
    }

    @PostMapping("/order")
    public void order(String storageId) {

    }
}
