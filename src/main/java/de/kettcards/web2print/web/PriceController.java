package de.kettcards.web2print.web;


import de.kettcards.web2print.config.ApplicationConfiguration;
import de.kettcards.web2print.model.OrderRefer;
import de.kettcards.web2print.service.CardService;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@CrossOrigin("*") //TODO remove
@RestController
@RequestMapping("${web2print.links.api-path}")
public class PriceController {

    private HttpClient http = HttpClient.newHttpClient();

    @Autowired
    private CardService cardService;

    @Autowired
    private ApplicationConfiguration configuration;


    @GetMapping("/order-ref/{orderId}")
    public OrderRefer getRefForOrder(@PathVariable String orderId) {
        //var card = cardService.findCard(orderId); //TODO change back to db check
        var link = "https://kettcards.de/page/" + orderId + ".php"; //TODO replace with shop link
        return getOrderRef("https://kettcards.de/php/info1.php", link); //TODO replace ref link
    }

    //TODO better way to get the prices
    private synchronized OrderRefer getOrderRef(String refUrl, String shopLink) { //http client thread safe?
        try {
            var request = HttpRequest.newBuilder().uri(URI.create(shopLink)).build();
            var body = http.send(request, HttpResponse.BodyHandlers.ofString()).body();
            var dom = Jsoup.parse(body);
            var ret = new OrderRefer(refUrl);
            //we just lookup the first form we found and use all valued attributes
            dom.getElementsByTag("form").get(0).getAllElements().forEach(e -> {
                var name = e.attr("name");
                var value = e.attr("value");
                if (!name.isEmpty() && !value.isEmpty()) {
                    //System.out.println("name : " + name + ", value : " + value);
                    ret.getAttributes().put(name, value);
                }
            });
            return ret;
        } catch (Exception ex) {
            throw new HttpClientErrorException(HttpStatus.SERVICE_UNAVAILABLE, "Bestellservice derzeit nicht verfügbar");
        }
    }
}
