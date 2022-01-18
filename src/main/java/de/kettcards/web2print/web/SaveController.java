package de.kettcards.web2print.web;

import de.kettcards.web2print.config.ApplicationConfiguration;
import de.kettcards.web2print.service.OrderingService;
import de.kettcards.web2print.service.UserLayoutService;
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
    private OrderingService orderingService;

    @Autowired
    private UserLayoutService userLayoutService;

    @PostMapping(value = {"/save/", "/save/{storageId}"})
    public String save(
            @PathVariable(required = false) String storageId,
            @RequestParam String export,
            @RequestParam("data") String cardData,
            @RequestParam(required = false) String form
    ) throws IOException, ParseException, MessagingException {
        if (export.equals("true")) {
            storageId = userLayoutService.storeCard(storageId, cardData);
            var internal_storageId = userLayoutService.storeCard(null, cardData);
            var file_path = orderingService.exportCard(cardData, internal_storageId, form);
            return "{\"sId\":\""+storageId+"\",\"iId\":\""+internal_storageId+"\",\"fp\":\""+file_path+"\"}";
        } else {
            return userLayoutService.storeCard(storageId, cardData);
        }
    }

    @GetMapping(value = {"/load/{storageId}"}, produces = "application/octet-stream")
    public String load(@PathVariable String storageId) throws IOException {
        return userLayoutService.loadCard(storageId);
    }

    @GetMapping(value = {"/pdfs"})
    public List<String> list() throws IOException, ParseException {
        return orderingService.list();
    }

    @GetMapping(value = {"/pdfs/{storageId}"}, produces = "application/pdf")
    public Resource show(@PathVariable(required = false) String storageId) throws IOException {
        return orderingService.load(storageId);
    }

}
