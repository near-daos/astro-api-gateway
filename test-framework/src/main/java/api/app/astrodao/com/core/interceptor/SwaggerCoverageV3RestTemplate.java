package api.app.astrodao.com.core.interceptor;

import com.github.viclovsky.swagger.coverage.CoverageOutputWriter;
import com.github.viclovsky.swagger.coverage.FileSystemOutputWriter;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.parameters.QueryParameter;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.servers.Server;
import org.assertj.core.util.Strings;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.stream.Collectors;

import static java.lang.String.valueOf;
import static org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED;

public class SwaggerCoverageV3RestTemplate implements ClientHttpRequestInterceptor {
    private static final String DELIMITER = "&";

    private CoverageOutputWriter writer;

    public SwaggerCoverageV3RestTemplate(CoverageOutputWriter writer) {
        this.writer = writer;
    }

    public SwaggerCoverageV3RestTemplate() {
        this.writer = new FileSystemOutputWriter(Paths.get("build/swagger-coverage-output"));
    }

    @NotNull
    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
            throws IOException {
        Operation operation = new Operation();
        String url = request.getURI().toString();

        String requestQuery = new URL(url).getQuery();
        if (!Strings.isNullOrEmpty(requestQuery)) {
            Arrays.stream(requestQuery.split(DELIMITER))
                    .map(s -> s.split("="))
                    .collect(Collectors.toMap(s -> s[0], s -> s[1]))
                    .forEach((n, v) -> operation.addParametersItem(new QueryParameter().name(n).example(v)));
        }

        request.getHeaders().forEach((key, value) ->
                operation.addParametersItem(new HeaderParameter().name(key).example(value)));

        if (body.length != 0) {
            MediaType mediaType = new MediaType();
            mediaType.setSchema(new Schema());
            String newBody = new String(body, StandardCharsets.UTF_8);
            if (request.getHeaders().getContentType().isCompatibleWith(APPLICATION_FORM_URLENCODED)) {
                Arrays.stream(newBody.split(DELIMITER))
                        .map(s -> s.split("="))
                        .collect(Collectors.toMap(s -> s[0], s -> s[1]))
                        .forEach((n, v) -> mediaType.getSchema().addProperties(n, new Schema().example(v)));
            }
        }

        ClientHttpResponse response = execution.execute(request, body);

        operation.responses(new ApiResponses().addApiResponse(valueOf(response.getRawStatusCode()),
                new ApiResponse().content(
                        new Content().addMediaType(response.getHeaders().getContentType().toString(), new MediaType())))
        );

        PathItem pathItem = new PathItem();
        pathItem.operation(PathItem.HttpMethod.valueOf(request.getMethod().name()), operation);
        OpenAPI openAPI = new OpenAPI()
                .addServersItem(new Server().url(URI.create(url).getHost()))
                .path(new URL(request.getURI().toString()).getPath(), pathItem);

        writer.write(openAPI);

        return response;
    }
}
