package api.app.astrodao.com.core.config;

import api.app.astrodao.com.core.utils.JsonUtils;
import com.github.javafaker.Faker;
import com.github.viclovsky.swagger.coverage.FileSystemOutputWriter;
import com.github.viclovsky.swagger.coverage.SwaggerCoverageV3RestAssured;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.config.ObjectMapperConfig;
import io.restassured.config.RestAssuredConfig;
import io.restassured.filter.log.LogDetail;
import io.restassured.specification.RequestSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;

import java.nio.file.Paths;

@Slf4j
@Configuration
@EnableAspectJAutoProxy
@ComponentScan(basePackages = "api.app.astrodao.com", lazyInit = true)
@PropertySource(factory = YamlPropertySourceFactory.class, value = "classpath:configs/framework.yml")
@PropertySource(factory = YamlPropertySourceFactory.class, value = "classpath:configs/${test.env}.yml")
public class FrameworkContextConfig {

    @Bean
    public Faker faker() {
        return new Faker();
    }

    @Bean
    public RequestSpecification requestSpec(@Value("${framework.api.base.uri}") String baseUri) {
        RestAssured.config = RestAssuredConfig.config().objectMapperConfig(
                new ObjectMapperConfig().jackson2ObjectMapperFactory((cls, charset) -> JsonUtils.MAPPER)
        );

        return new RequestSpecBuilder()
                .setBaseUri(baseUri)
                .log(LogDetail.ALL)
                .addFilter(new AllureRestAssured())
                .addFilter(new SwaggerCoverageV3RestAssured(
                        new FileSystemOutputWriter(Paths.get("build/swagger-coverage-output")))
                )
                .addHeader("User-Agent", "API Test Framework")
                .build();
    }
}
