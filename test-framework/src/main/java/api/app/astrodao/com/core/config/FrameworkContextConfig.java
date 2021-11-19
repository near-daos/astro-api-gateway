package api.app.astrodao.com.core.config;

import com.github.javafaker.Faker;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import org.assertj.core.util.Lists;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.OkHttp3ClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.util.concurrent.TimeUnit;

import static org.springframework.http.converter.json.AbstractJsonHttpMessageConverter.DEFAULT_CHARSET;

@Slf4j
@Configuration
@EnableAspectJAutoProxy
@ComponentScan(basePackages = "api.app.astrodao.com", lazyInit = true)
@PropertySource(factory = YamlPropertySourceFactory.class, value = "classpath:configs/framework.yml")
@PropertySource(factory = YamlPropertySourceFactory.class, value = "classpath:configs/${test.env}.yml")
public class FrameworkContextConfig {

    @Value("${framework.http.timeout}")
    private int timeoutInSeconds;

    @Bean
    public Faker faker() {
        return new Faker();
    }

    @Bean
    public OkHttpClient okHttpClient() {
        final CookieManager cookieManager = new CookieManager();
        cookieManager.setCookiePolicy(CookiePolicy.ACCEPT_ALL);

        return new OkHttpClient.Builder()
                .pingInterval(10, TimeUnit.SECONDS)
                .callTimeout(20, TimeUnit.SECONDS)
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .writeTimeout(15, TimeUnit.SECONDS)
                .followRedirects(true)
                .followSslRedirects(true)
                .retryOnConnectionFailure(true).build();
    }

    @Bean
    public RestTemplate restTemplate(OkHttpClient okHttpClient) {
        ClientHttpRequestFactory factory = new BufferingClientHttpRequestFactory(new OkHttp3ClientHttpRequestFactory(okHttpClient));
        RestTemplate template = new RestTemplate(new BufferingClientHttpRequestFactory(factory));

        DefaultUriBuilderFactory handler = new DefaultUriBuilderFactory();
        handler.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
        template.setUriTemplateHandler(handler);

        for (HttpMessageConverter converter : template.getMessageConverters()) {
            if (converter instanceof StringHttpMessageConverter) {
                ((StringHttpMessageConverter) converter).setWriteAcceptCharset(false);
            }
        }

        template.getMessageConverters().add(textMessageConverter());
        template.setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public boolean hasError(@NotNull HttpStatus statusCode) {
                return false;
            }
        });

        return template;
    }

    private HttpMessageConverter textMessageConverter() {
        MappingJackson2HttpMessageConverter textMessageConverter = new MappingJackson2HttpMessageConverter();
        textMessageConverter.setSupportedMediaTypes(Lists.newArrayList(
                new MediaType("text", "javascript", DEFAULT_CHARSET))
        );
        return textMessageConverter;
    }
}
